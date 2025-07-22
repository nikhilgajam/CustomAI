const TOKEN_KEY = 'CustomAI';

// Set tokens with expiration time
export const setToken = (accessToken, refreshToken) => {
  const expiration = Date.now() + ((10 * 24 * 60 * 60 * 1000) - (10 * 60 * 1000)); // (10 days - 10 minutes) in milliseconds
  const tokenData = {
    accessToken,
    refreshToken,
    expirationTime: expiration
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
};

// Get token data if still valid
export const getToken = () => {
  const tokenData = localStorage.getItem(TOKEN_KEY);
  
  if (!tokenData) {
    return null;
  }

  try {
    const parsed = JSON.parse(tokenData);
    
    if (!parsed.expirationTime || Date.now() > parsed.expirationTime) {
      deleteToken();
      return null;
    }

    return parsed;
  } catch (error) {
    deleteToken();
    return null;
  }
};

// Delete token data
export const deleteToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
