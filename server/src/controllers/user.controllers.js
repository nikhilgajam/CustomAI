import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/ErrorResponse.js';
import { SuccessResponse } from '../utils/SuccessResponse.js';
import { User } from '../models/user.models.js';
import { Data } from '../models/data.models.js';
import { options } from '../constants.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    // Save the refresh token in the database
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ErrorResponse(500, 'Error generating access and refresh tokens.', [error?.message]);
  }
}

const registerUser = asyncHandler(async (req, res, next) => {
  const { userName = '', email = '', password = '', initialPrompt = '' } = req?.body || {};

  // Validation
  if (![userName, email, password, initialPrompt].every((field) => field?.trim())) {
    throw new ErrorResponse(400, 'Please provide all the required fields.');
  }

  // Check if user already exists
  const user = await User.findOne({
    $or: [
      { userName: userName.toLowerCase() },
      { email: email.toLowerCase() },
    ]
  });

  if (user) {
    throw new ErrorResponse(400, '\'userName\' or \'email\' already exists. Please try again with different values.');
  }

  let txtData = undefined;
  if (req?.file?.buffer) {
    // Check if the uploaded file is a PDF
    const fileType = req?.file?.mimetype;
    if (fileType !== 'text/plain') {
      throw new ErrorResponse(400, 'Please upload a valid text(\'.txt\') file.');
    }

    // Extract text from the txtFile
    try {
      txtData = req?.file?.buffer?.toString();
    } catch (error) {
      throw new ErrorResponse(500, 'Error extracting text from the uploaded txtFile.', [error?.message]);
    }
  }

  const createdUser = await User.create({
    userName: userName.toLowerCase(),
    email: email.toLowerCase(),
    password: password.toLowerCase(),
  });

  await Data.create({
    userName: userName.toLowerCase(),
    initialPrompt,
    txtData,
  });

  const userObj = await User.findById(createdUser._id).select('-password -refreshToken -__v');

  if (!userObj) {
    throw new ErrorResponse(404, 'User not found.');
  }

  return res.status(200).json(
    new SuccessResponse(200, userObj, 'User created successfully.')
  );
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { userName = '', email = '', password = '' } = req?.body || {};

  // Validation
  const userOrEmailPresent = [userName, email].some((field) => field?.trim());
  if (!userOrEmailPresent || !password?.trim()) {
    throw new ErrorResponse(400, 'Please provide (\'userName\' or \'email\') and (\'password\') to login.');
  }

  // Check if user exists
  const user = await User.findOne({
    $or: [
      { userName: userName.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
    ]
  }).select('+password');

  if (!user) {
    throw new ErrorResponse(400, 'No user found. Please try again with correct \'userName\' or \'email\'.');
  }

  // Check if password is correct
  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    throw new ErrorResponse(401, 'Invalid credentials. Please try again.');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken -__v');
  if (!loggedInUser) {
    throw new ErrorResponse(404, 'User not found.');
  }

  // Set the access and refresh token in the cookie
  return res
    .status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new SuccessResponse(
      200,
      { user: loggedInUser, accessToken, refreshToken },
      'User logged in successfully.'
    ));
});

const renewAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ErrorResponse(401, 'No refresh token found. Please login again.');
  }

  // Verify the refresh token
  const user = await User.findOne({ refreshToken: incomingRefreshToken });
  if (!user) {
    throw new ErrorResponse(401, 'Invalid refresh token. Please login again.');
  }

  // Verifying JWT
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the refresh token is tampered
    if (decodedToken?._id?.toString() !== user?._id?.toString()) {
      throw new ErrorResponse(401, 'Refresh token is tampered. Please login again.');
    }

    // Check if the refresh token is expired
    if (decodedToken?.exp < Date.now() / 1000) {
      throw new ErrorResponse(401, 'Refresh token is expired. Please login again.');
    }
  } catch (error) {
    throw new ErrorResponse(401, 'Refresh token is invalid. Please login again.', [error?.message]);
  }

  // Generate a new access token
  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

  // Set the access and refresh token in the cookie
  return res
    .status(200)
    .cookie('refreshToken', newRefreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new SuccessResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      'Refresh token renewed successfully.'
    ));
});

const editUser = asyncHandler(async (req, res, next) => {
  const { email = '', oldPassword = '', newPassword = '', initialPrompt = '' } = req?.body || {};

  // Validation
  if (![email, newPassword, initialPrompt, req?.file?.toString()].some((field) => field?.trim())) {
    throw new ErrorResponse(400, 'Please provide atleast one valid field to update.');
  }

  // Check if user exists
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ErrorResponse(404, 'User not found.');
  }

  // Check if data object exists
  const data = await Data.findOne({ userName: user.userName });
  if (!data) {
    throw new ErrorResponse(404, 'Data object not found to update.');
  }

  // Update user details
  if (email?.trim())
    user.email = email.toLowerCase();

  if (newPassword?.trim()) {
    // Check if old password is provided
    if (!oldPassword?.trim()) {
      throw new ErrorResponse(400, 'Please provide the \'oldPassword\' to update the new password.');
    }

    // Check if old password is correct
    const validPassword = await user.comparePassword(oldPassword);
    if (!validPassword) {
      throw new ErrorResponse(401, 'Invalid \'oldPassword\'. Please try again.');
    }

    user.password = newPassword.toLowerCase();
  }

  if (initialPrompt?.trim())
    data.initialPrompt = initialPrompt;

  if (req?.file?.buffer) {
    // Check if the uploaded file is a PDF
    const fileType = req?.file?.mimetype;
    if (fileType !== 'text/plain') {
      throw new ErrorResponse(400, 'Please upload a valid text(\'.txt\') file.');
    }

    // Extract text from the txtFile
    try {
      data.txtData = req.file.buffer.toString();
    } catch (error) {
      throw new ErrorResponse(500, 'Error extracting text from the uploaded txtFile.', [error?.message]);
    }
  }

  // Saving the provided data
  await user.save();
  await data.save();

  // Deleting sensitive
  delete user.refreshToken;
  delete user.password;
  delete user.__v;
  delete data.__v;
  delete data.userName;

  // Showing only 51 characters of txtData
  data.txtData = data.txtData?.substring(0, 51) + '...';

  // Returning success response
  return res.status(200).json(
    new SuccessResponse(200, {
      user, data
    }, 'User and data updated successfully.')
  );
});

const deleteUser = asyncHandler(async (req, res, next) => {
  // Check if user exists and delete
  const user = await User.findByIdAndDelete(req?.user?._id);
  if (!user) {
    throw new ErrorResponse(404, 'User not found.');
  }

  // Check if data object exists and delete
  const data = await Data.findOneAndDelete({ userName: user.userName });
  if (!data) {
    throw new ErrorResponse(404, 'Data object not found to delete.');
  }

  return res.status(200).json(
    new SuccessResponse(200, null, 'User and data deleted successfully.')
  );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: undefined,
      }
    },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie('refreshToken', options)
    .clearCookie('accessToken', options)
    .json(new SuccessResponse(
      200,
      null,
      'User logged out successfully.'
    ));
});

export {
  registerUser,
  loginUser,
  renewAccessToken,
  editUser,
  deleteUser,
  logoutUser,
};
