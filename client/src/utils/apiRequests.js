import axios from "axios";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const signInRequest = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/api/v1/user/login`, data, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signUpRequest = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/api/v1/user/register`, data, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRequest = async (data, accessToken) => {
  try {
    const response = await axios.put(`${apiUrl}/api/v1/user/edit`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const llmRequest = async (data, accessToken) => {
  try {
    const response = await axios.post(`${apiUrl}/api/v1/llm/generateAIResponse`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const renewTokensRequest = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/api/v1/user/renewAccessToken`, data, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signOutRequest = async () => {
  try {
    const response = await axios.post(`${apiUrl}/api/v1/user/logout`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
