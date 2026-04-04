import api from './axios';
import { unwrapDataFromResponse } from './envelope';

function axiosErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  return fallback || error.message || 'Request failed';
}

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return unwrapDataFromResponse(response);
    } catch (e) {
      throw new Error(axiosErrorMessage(e, 'Login failed'));
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return unwrapDataFromResponse(response);
    } catch (e) {
      throw new Error(axiosErrorMessage(e, 'Signup failed'));
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return unwrapDataFromResponse(response);
    } catch (e) {
      throw new Error(axiosErrorMessage(e, 'Request failed'));
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      return unwrapDataFromResponse(response);
    } catch (e) {
      throw new Error(axiosErrorMessage(e, 'Password reset failed'));
    }
  },
};
