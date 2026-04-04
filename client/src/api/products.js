import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const productsApi = {
  getProducts: async (params) => {
    const response = await api.get('/products', { params });
    return unwrapPaginatedResponse(response);
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return unwrapDataFromResponse(response);
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return unwrapDataFromResponse(response);
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return unwrapDataFromResponse(response);
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return unwrapDataFromResponse(response);
  },

  createVariant: async (productId, variantData) => {
    const response = await api.post(`/products/${productId}/variants`, variantData);
    return unwrapDataFromResponse(response);
  },

  updateVariant: async (productId, variantId, variantData) => {
    const response = await api.put(`/products/${productId}/variants/${variantId}`, variantData);
    return unwrapDataFromResponse(response);
  },

  deleteVariant: async (productId, variantId) => {
    const response = await api.delete(`/products/${productId}/variants/${variantId}`);
    return unwrapDataFromResponse(response);
  },
};
