const TOKEN_KEY = 'CustomAiToken';

// Set token with 10 days TTL
export const setToken = () => {
  const expiration = Date.now() + ((10 * 24 * 60 * 60 * 1000) - (10 * 60 * 1000)); // 10 days in milliseconds - 10 minutes
  localStorage.setItem(TOKEN_KEY, expiration);
};

// Get token if still valid
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (!token || Date.now() > token) {
    deleteToken();
    return null;
  }

  return token;
};

// Delete token and expiration
export const deleteToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
