import { useState } from 'react';
import './SignUp.css';
import toast, { Toaster } from 'react-hot-toast';
import { signUpRequest } from '../utils/apiRequests';

function SignUp() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('userName', formData.userName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('initialPrompt', formData.initialPrompt);
    if (formData.txtFile) {
      formDataToSend.append('txtFile', formData.txtFile);
    }

    try {
      const res = await signUpRequest(formDataToSend);
      window.location.href = '/signin';
    } catch (error) {
      toast.error('Sign Up Error: ' + error?.response?.data?.message);
      console.error('Sign Up Error:', error);
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
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Join CustomAI today</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
                required
                autoFocus
              />
              <label className="signup-label">Username</label>
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
                required
              />
              <label className="signup-label">Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="signup-input"
                placeholder=" "
                required
              />
              <label className="signup-label">Password</label>
            </div>

            <div className="input-group">
              <textarea
                name="initialPrompt"
                value={formData.initialPrompt}
                onChange={handleInputChange}
                className="signup-textarea"
                placeholder=" "
                rows="4"
                required
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
                  {formData.txtFile ? formData.txtFile.name : 'Upload .txt file for elaborated context for LLM (Optional)'}
                </span>
              </label>
            </div>

            <button type="submit" className="signup-btn primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?
              <br />
              <button
                type="button"
                className="signin-btn"
                onClick={() => window.location.href = '/signin'}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
