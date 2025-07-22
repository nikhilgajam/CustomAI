import { useState } from 'react';
import './SignUp.css';
import toast, { Toaster } from 'react-hot-toast';
import { updateRequest, renewTokensRequest } from '../utils/apiRequests';
import { getToken, setToken, deleteToken } from '../utils/tokenManager';

function Update() {
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    initialPrompt: '',
    txtFile: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      setFormData({
        ...formData,
        txtFile: file
      });
    } else if (file) {
      alert('Please select a .txt file only');
      e.target.value = '';
    }
  };

  const isFormValid = () => {
    const hasPasswordFields = formData.oldPassword.trim() || formData.newPassword.trim();
    const bothPasswordsFilled = formData.oldPassword.trim() && formData.newPassword.trim();
    const hasOtherField = formData.email.trim() || formData.initialPrompt.trim() || formData.txtFile;

    if (hasPasswordFields && !bothPasswordsFilled) return false;
    return hasOtherField || bothPasswordsFilled;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    if (formData.email) formDataToSend.append('email', formData.email);
    if (formData.oldPassword) formDataToSend.append('oldPassword', formData.oldPassword);
    if (formData.newPassword) formDataToSend.append('newPassword', formData.newPassword);
    if (formData.initialPrompt) formDataToSend.append('initialPrompt', formData.initialPrompt);
    if (formData.txtFile) formDataToSend.append('txtFile', formData.txtFile);

    const token = getToken();
    try {
      if (token === null) {
        deleteToken();
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/signin';
        return;
      }

      await updateRequest(formDataToSend, token.accessToken);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error?.response?.data?.message || 'An error occurred while updating your profile.';
      if (message === 'jwt expired') {
        try {
          const response = await renewTokensRequest({ refreshToken: token.refreshToken });
          toast.success('Session renewed successfully!');

          // Adding new token
          deleteToken();
          setToken(response.data.accessToken, response.data.refreshToken);

          handleSubmit();
        } catch (renewError) {
          toast.error('Session renewal failed: ' + renewError?.response?.data?.message);
          console.error('Renew Error:', renewError);
          window.location.href = '/signin';
        }
        return;
      }

      toast.error('Update Error: ' + error?.response?.data?.message);
      console.error('Update Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Toaster
        toastOptions={{
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
          },
        }}
      />
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Update Profile</h1>
            <p className="signup-subtitle">Update your account settings</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
                autoFocus
              />
              <label className="signup-label">Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
              />
              <label className="signup-label">Old Password</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
              />
              <label className="signup-label">New Password</label>
            </div>

            <div className="input-group">
              <textarea
                name="initialPrompt"
                value={formData.initialPrompt}
                onChange={handleInputChange}
                className="signup-textarea"
                placeholder=" "
                rows="4"
              />
              <label className="signup-label">AI Role / Initial Prompt</label>
            </div>

            <div className="file-group">
              <label className="file-label">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <span className="file-button">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor" />
                  </svg>
                  {formData.txtFile ? formData.txtFile.name : 'Upload .txt file'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="signup-btn primary"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Done with editing?
              <br />
              <button
                type="button"
                className="signin-btn"
                onClick={() => window.location.href = '/chat'}
              >
                Go To Chat
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Update;
