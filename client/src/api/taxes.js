import api from './axios';
import { unwrapDataFromResponse } from './envelope';

export const taxesApi = {
  getTaxes: async (params) => {
    const response = await api.get('/taxes', { params });
    return unwrapDataFromResponse(response);
  },

  createTax: async (taxData) => {
    const response = await api.post('/taxes', taxData);
    return unwrapDataFromResponse(response);
  },

  updateTax: async (id, taxData) => {
    const response = await api.put(`/taxes/${id}`, taxData);
    return unwrapDataFromResponse(response);
  },

  deleteTax: async (id) => {
    const response = await api.delete(`/taxes/${id}`);
    return unwrapDataFromResponse(response);
  },
};
