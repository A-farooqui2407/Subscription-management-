import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const invoicesApi = {
  getInvoices: async (params) => {
    const response = await api.get('/invoices', { params });
    return unwrapPaginatedResponse(response);
  },

  getInvoiceById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return unwrapDataFromResponse(response);
  },

  createInvoice: async (data) => {
    const response = await api.post('/invoices', data);
    return unwrapDataFromResponse(response);
  },

  updateStatus: async (id, newStatus) => {
    const s = String(newStatus).toLowerCase();
    if (s === 'confirmed') {
      const response = await api.put(`/invoices/${id}/confirm`);
      return unwrapDataFromResponse(response);
    }
    if (s === 'cancelled') {
      const response = await api.put(`/invoices/${id}/cancel`);
      return unwrapDataFromResponse(response);
    }
    throw new Error(`Unsupported invoice status action: ${newStatus}`);
  },
};
