import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const subscriptionsApi = {
  getSubscriptions: async (params) => {
    const response = await api.get('/subscriptions', { params });
    return unwrapPaginatedResponse(response);
  },

  getSubscriptionById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return unwrapDataFromResponse(response);
  },

  createSubscription: async (data) => {
    const response = await api.post('/subscriptions', data);
    return unwrapDataFromResponse(response);
  },

  updateSubscription: async (id, data) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return unwrapDataFromResponse(response);
  },

  updateStatus: async (id, newStatus) => {
    const response = await api.put(`/subscriptions/${id}/status`, { status: newStatus });
    return unwrapDataFromResponse(response);
  },
};
