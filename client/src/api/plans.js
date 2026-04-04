import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const plansApi = {
  getPlans: async (params) => {
    const response = await api.get('/plans', { params });
    return unwrapPaginatedResponse(response);
  },

  createPlan: async (planData) => {
    const response = await api.post('/plans', planData);
    return unwrapDataFromResponse(response);
  },

  updatePlan: async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return unwrapDataFromResponse(response);
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return unwrapDataFromResponse(response);
  },
};
