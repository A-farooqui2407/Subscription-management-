import api from './axios';

let mockPlans = [
  { 
    id: 1, 
    name: 'Pro Tier Subscription', 
    price: 49.99, 
    billingPeriod: 'Monthly', 
    minQty: 1, 
    startDate: '2025-01-01', 
    endDate: '', 
    options: {
      autoClose: false,
      closable: true,
      pausable: true,
      renewable: true
    },
    isActive: true,
    subscriptionsCount: 142
  },
  { 
    id: 2, 
    name: 'Enterprise Cloud Retainer', 
    price: 1200.00, 
    billingPeriod: 'Yearly', 
    minQty: 5, 
    startDate: '2024-06-01', 
    endDate: '2028-12-31', 
    options: {
      autoClose: true,
      closable: false,
      pausable: false,
      renewable: true
    },
    isActive: true,
    subscriptionsCount: 18
  },
];

export const plansApi = {
  getPlans: async (params) => {
    try {
      const response = await api.get('/plans', { params });
      return response.data;
    } catch (e) {
      const { billingPeriod = '', isActive = '' } = params || {};
      
      let filtered = mockPlans;

      if (billingPeriod) {
        filtered = filtered.filter(p => p.billingPeriod === billingPeriod);
      }
      
      if (isActive !== '') {
        const boolActive = isActive === 'true';
        filtered = filtered.filter(p => p.isActive === boolActive);
      }
      
      return filtered;
    }
  },

  createPlan: async (planData) => {
    try {
      const response = await api.post('/plans', planData);
      return response.data;
    } catch (e) {
      const newPlan = { 
        id: Math.floor(Math.random() * 10000), 
        subscriptionsCount: 0, 
        ...planData 
      };
      mockPlans.unshift(newPlan);
      return newPlan;
    }
  },

  updatePlan: async (id, planData) => {
    try {
      const response = await api.put(`/plans/${id}`, planData);
      return response.data;
    } catch (e) {
      mockPlans = mockPlans.map(p => p.id === Number(id) ? { ...p, ...planData } : p);
      return mockPlans.find(p => p.id === Number(id));
    }
  },

  deletePlan: async (id) => {
    try {
      const response = await api.delete(`/plans/${id}`);
      return response.data;
    } catch (e) {
      mockPlans = mockPlans.filter(p => p.id !== Number(id));
      return { success: true };
    }
  }
};
