import { useState, useEffect } from 'react';
import { getToken, deleteToken } from '../utils/tokenManager';
import toast, { Toaster } from 'react-hot-toast';
import { signOutRequest } from '../utils/apiRequests';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    const chatOrUpdate = (window.location.href.endsWith('/chat') || window.location.href.endsWith('/update'));
    if (chatOrUpdate && token !== null) {
      setIsLoggedIn(true);
    } else if (chatOrUpdate && token === null) {
      deleteToken();
      window.location.href = '/signin';
    }
  }, []);

  const handleSignIn = () => {
    window.location.href = '/signin';
  };

  const handleSignOut = async () => {
    try {
      await signOutRequest();
      deleteToken();
      window.location.href = '/';
    } catch (error) {
      toast.error('Sign Out Error: ' + error?.response?.data?.message);
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <header>
      <Toaster
        toastOptions={{
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
          },
        }}
      />
      {/* Logo Button */}
      <button
        className='header-logo-button'
        onClick={() => window.location.href = '/'}
      >
        <img src='/logo.png' alt='Custom AI' title='Custom AI' width={40} />
      </button>

      {/* Sign Button */}
      <button
        className='header-sign-button'
        onClick={isLoggedIn ? handleSignOut : handleSignIn}
      >
        {isLoggedIn ? 'Sign Out' : 'Sign In'}
      </button>
    </header>
  );
}

export default Header;
