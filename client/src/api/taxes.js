import api from './axios';

let mockTaxes = [
  { id: 1, name: 'Standard General Tax', percentage: 20, type: 'VAT', isActive: true },
  { id: 2, name: 'Digital Service Surcharge', percentage: 5.5, type: 'Digital Tax', isActive: true },
  { id: 3, name: 'Legacy EU Tax', percentage: 15, type: 'Sales', isActive: false },
];

export const taxesApi = {
  getTaxes: async (params) => {
    try {
      const response = await api.get('/taxes', { params });
      return response.data;
    } catch (e) {
      const { isActive = '' } = params || {};
      
      let filtered = mockTaxes;
      if (isActive !== '') {
        const boolActive = isActive === 'true';
        filtered = filtered.filter(t => t.isActive === boolActive);
      }
      
      return filtered; // returning unpaginated typically for small sets, or paginated if needed
    }
  },

  createTax: async (taxData) => {
    try {
      const response = await api.post('/taxes', taxData);
      return response.data;
    } catch (e) {
      const newTax = { id: Math.floor(Math.random() * 1000), ...taxData };
      mockTaxes.unshift(newTax);
      return newTax;
    }
  },

  updateTax: async (id, taxData) => {
    try {
      const response = await api.put(`/taxes/${id}`, taxData);
      return response.data;
    } catch (e) {
      mockTaxes = mockTaxes.map(t => t.id === Number(id) ? { ...t, ...taxData } : t);
      return mockTaxes.find(t => t.id === Number(id));
    }
  },

  deleteTax: async (id) => {
    try {
      const response = await api.delete(`/taxes/${id}`);
      return response.data;
    } catch (e) {
      mockTaxes = mockTaxes.filter(t => t.id !== Number(id));
      return { success: true };
    }
  }
};
