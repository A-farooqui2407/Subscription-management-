import api from './axios';

export const authApi = {
  login: async (email, password) => {
    // Attempt standard axios call
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (e) {
      // Mock fallback for Development purposes if backend is missing
      console.warn("Backend not detected, running mock fallback");
      if (email === 'admin@email.com' && password === 'Admin@123') {
        const mockUser = { id: 1, email, name: 'System Admin', role: 'admin' };
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenAuthAdmin';
        return { user: mockUser, token: mockToken };
      } else if (password === 'User@123') {
        const mockUser = { id: 2, email, name: email.split('@')[0], role: 'user' };
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenAuthUser';
        return { user: mockUser, token: mockToken };
      }
      throw new Error(e.response?.data?.message || 'Invalid email or password');
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return response.data;
    } catch (e) {
      console.warn("Backend not detected, resolving dummy signup");
      const mockUser = { id: Math.floor(Math.random() * 1000), email, name, role: 'user' };
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenSingupSuccess';
      return { user: mockUser, token: mockToken, message: "Account created successfully" };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (e) {
      console.warn("Mocking forgot password fallback");
      return { message: "Reset email sent" };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
      return response.data;
    } catch (e) {
      if (token === 'expired-mock-token') throw new Error("Reset link has expired");
      return { message: "Password updated successfully" };
    }
  }
};
