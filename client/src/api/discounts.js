import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const discountsApi = {
  getDiscounts: async (params) => {
    const response = await api.get('/discounts', { params });
    return unwrapPaginatedResponse(response);
  },

  createDiscount: async (discountData) => {
    const response = await api.post('/discounts', discountData);
    return unwrapDataFromResponse(response);
  },

  updateDiscount: async (id, discountData) => {
    const response = await api.put(`/discounts/${id}`, discountData);
    return unwrapDataFromResponse(response);
  },

  deleteDiscount: async (id) => {
    const response = await api.delete(`/discounts/${id}`);
    return unwrapDataFromResponse(response);
  },
};
