import { useState } from 'react';
import './SignIn.css';
import toast, { Toaster } from 'react-hot-toast';
import { setToken } from '../utils/tokenManager';
import { signInRequest } from '../utils/apiRequests';

function SignIn() {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signInRequest(formData);
      setToken(response.data.accessToken, response.data.refreshToken);
      window.location.href = '/chat';
    } catch (error) {
      toast.error('Sign In Error: ' + error?.response?.data?.message);
      console.error('Sign In Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <Toaster
        toastOptions={{
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
          },
        }}
      />
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <h1 className="signin-title">Welcome Back</h1>
            <p className="signin-subtitle">Sign in to your account</p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="signin-input"
                placeholder=" "
                required
                autoFocus
              />
              <label className="signin-label">Username</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="signin-input"
                placeholder=" "
                required
              />
              <label className="signin-label">Password</label>
            </div>

            <button type="submit" className="signin-btn primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="signin-footer">
            <p>
              Don't have an account?
              <button
                type="button"
                className="signup-btn"
                onClick={() => window.location.href = '/signup'}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
