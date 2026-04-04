import api from './axios';

let mockDiscounts = [
  { 
    id: 1, 
    name: 'Summer SaaS Promo', 
    type: 'Percentage', 
    value: 20, 
    minPurchase: 0, 
    minQty: 0, 
    startDate: '2026-06-01', 
    endDate: '2026-08-31', 
    limitUsage: 100, 
    used: 45, 
    appliesTo: 'Subscriptions', 
    isActive: true 
  },
  { 
    id: 2, 
    name: 'Hardware Welcome', 
    type: 'Fixed', 
    value: 50, 
    minPurchase: 200, 
    minQty: 1, 
    startDate: '2025-01-01', 
    endDate: '2025-12-31', 
    limitUsage: null, 
    used: 12, 
    appliesTo: 'Products', 
    isActive: false // Expired technically based on date
  },
];

export const discountsApi = {
  getDiscounts: async (params) => {
    try {
      const response = await api.get('/discounts', { params });
      return response.data;
    } catch (e) {
      const { appliesTo = '', isActive = '' } = params || {};
      
      let filtered = mockDiscounts;

      if (appliesTo) {
        filtered = filtered.filter(d => d.appliesTo === appliesTo);
      }
      
      if (isActive !== '') {
        const boolActive = isActive === 'true';
        filtered = filtered.filter(d => d.isActive === boolActive);
      }
      
      return filtered;
    }
  },

  createDiscount: async (discountData) => {
    try {
      const response = await api.post('/discounts', discountData);
      return response.data;
    } catch (e) {
      const newDiscount = { id: Math.floor(Math.random() * 1000), used: 0, ...discountData };
      mockDiscounts.unshift(newDiscount);
      return newDiscount;
    }
  },

  updateDiscount: async (id, discountData) => {
    try {
      const response = await api.put(`/discounts/${id}`, discountData);
      return response.data;
    } catch (e) {
      mockDiscounts = mockDiscounts.map(d => d.id === Number(id) ? { ...d, ...discountData } : d);
      return mockDiscounts.find(d => d.id === Number(id));
    }
  },

  deleteDiscount: async (id) => {
    try {
      const response = await api.delete(`/discounts/${id}`);
      return response.data;
    } catch (e) {
      mockDiscounts = mockDiscounts.filter(d => d.id !== Number(id));
      return { success: true };
    }
  }
};
