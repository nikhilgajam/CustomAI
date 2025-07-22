import { ErrorResponse } from '../utils/ErrorResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Checking if the token is present in cookies for PC or in the authorization header for Mobile
    const authHeader = req.headers.authorization || req.header('Authorization');
    const token = req.cookies?.accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      console.log('No token found');
      throw new ErrorResponse(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken -__v');

    if (!user) {
      console.log('Invalid Access Token');
      throw new ErrorResponse(401, 'Invalid Access Token');
    }

    // Adding user to request object which can be used by controllers which uses this middleware
    req.user = user;
    console.log('User authenticated:', user?.userName);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error occurred during token verification:', error?.message);
    throw new ErrorResponse(401, error?.message || 'Invalid access token', [error?.message]);
  }

});

export { verifyJWT };
