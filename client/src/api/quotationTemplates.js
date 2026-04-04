import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const quotationTemplatesApi = {
  getTemplates: async (params) => {
    const response = await api.get('/quotation-templates', { params });
    return unwrapPaginatedResponse(response);
  },

  getTemplateById: async (id) => {
    const response = await api.get(`/quotation-templates/${id}`);
    return unwrapDataFromResponse(response);
  },

  createTemplate: async (data) => {
    const response = await api.post('/quotation-templates', data);
    return unwrapDataFromResponse(response);
  },

  updateTemplate: async (id, data) => {
    const response = await api.put(`/quotation-templates/${id}`, data);
    return unwrapDataFromResponse(response);
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/quotation-templates/${id}`);
    return unwrapDataFromResponse(response);
  },
};
