import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const contactsApi = {
  getContacts: async (params) => {
    const response = await api.get('/contacts', { params });
    return unwrapPaginatedResponse(response);
  },

  createContact: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return unwrapDataFromResponse(response);
  },

  updateContact: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return unwrapDataFromResponse(response);
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return unwrapDataFromResponse(response);
  },
};
