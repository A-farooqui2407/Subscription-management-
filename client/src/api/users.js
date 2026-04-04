import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const usersApi = {
  getUsers: async (params) => {
    const response = await api.get('/users', { params });
    return unwrapPaginatedResponse(response);
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return unwrapDataFromResponse(response);
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return unwrapDataFromResponse(response);
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return unwrapDataFromResponse(response);
  },
};
