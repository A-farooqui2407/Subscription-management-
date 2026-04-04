import api from './axios';

// Mock list
let mockContacts = [
  { id: 1, name: 'Tech Solutions Inc', email: 'billing@techsol.com', phone: '555-0100', type: 'Customer' },
  { id: 2, name: 'Global Logistics', email: 'admin@gllogistics.com', phone: '555-0122', type: 'Customer' },
  { id: 3, name: 'Acme Corp', email: 'acme@acme.com', phone: '800-ACME-000', type: 'Partner' },
  { id: 4, name: 'Design Studio XYZ', email: 'hello@xyz.design', phone: '555-0199', type: 'Lead' },
  { id: 5, name: 'Cloud Provider', email: 'support@cloud.com', phone: '555-8888', type: 'Vendor' },
];

export const contactsApi = {
  getContacts: async (params) => {
    try {
      const response = await api.get('/contacts', { params });
      return response.data;
    } catch (e) {
      console.warn("Mocking contact fetch fallback");
      const { search = '', type = '', page = 1, limit = 10 } = params || {};
      
      let filtered = mockContacts.filter(c => 
        (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
        (type ? c.type.toLowerCase() === type.toLowerCase() : true)
      );
      
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      
      return { data: paginated, total, page, limit };
    }
  },

  createContact: async (contactData) => {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (e) {
      const newContact = { id: Math.floor(Math.random() * 10000), ...contactData };
      mockContacts.unshift(newContact);
      return newContact;
    }
  },

  updateContact: async (id, contactData) => {
    try {
      const response = await api.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (e) {
      mockContacts = mockContacts.map(c => c.id === id ? { ...c, ...contactData } : c);
      return mockContacts.find(c => c.id === id);
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (e) {
      mockContacts = mockContacts.filter(c => c.id !== id);
      return { success: true };
    }
  }
};
