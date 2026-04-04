import api from './axios';

let mockSubscriptions = [
  {
    id: 1,
    subNumber: 'SUB-2026-0001',
    customerId: 1,  // Relates to Contacts
    planId: 1,
    startDate: '2026-05-01',
    expirationDate: '2026-06-01',
    paymentTerms: 'NET 30',
    discountId: null,
    status: 'active', // draft → quotation → confirmed → active → closed
    lines: [
      { id: 101, productId: 1, variantId: 101, taxId: 1, qty: 10, unitPrice: 49.99 }
    ],
    subtotal: 499.90,
    taxTotal: 99.98, // 20%
    total: 599.88
  },
  {
    id: 2,
    subNumber: 'SUB-2026-0002',
    customerId: 2,
    planId: 2,
    startDate: '2026-05-15',
    expirationDate: '2027-05-15',
    paymentTerms: 'Due on Receipt',
    discountId: 1,
    status: 'draft',
    lines: [
      { id: 102, productId: 2, variantId: 201, taxId: null, qty: 5, unitPrice: 69.99 }
    ],
    subtotal: 349.95,
    taxTotal: 0,
    total: 349.95
  }
];

export const subscriptionsApi = {
  getSubscriptions: async (params) => {
    try {
      const response = await api.get('/subscriptions', { params });
      return response.data;
    } catch (e) {
      const { status = '', customerId = '' } = params || {};
      let filtered = mockSubscriptions;
      
      if (status) filtered = filtered.filter(s => s.status === status);
      if (customerId) filtered = filtered.filter(s => s.customerId === Number(customerId));
      
      return filtered;
    }
  },

  getSubscriptionById: async (id) => {
    try {
      const response = await api.get(`/subscriptions/${id}`);
      return response.data;
    } catch (e) {
      const sub = mockSubscriptions.find(s => s.id === Number(id));
      if (!sub) throw new Error("Subscription not found");
      return sub;
    }
  },

  createSubscription: async (data) => {
    try {
      const response = await api.post('/subscriptions', data);
      return response.data;
    } catch (e) {
      const newSub = { 
        id: Math.floor(Math.random() * 10000),
        subNumber: `SUB-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        status: data.status || 'draft',
        ...data 
      };
      mockSubscriptions.unshift(newSub);
      return newSub;
    }
  },

  updateSubscription: async (id, data) => {
    try {
      const response = await api.put(`/subscriptions/${id}`, data);
      return response.data;
    } catch (e) {
      mockSubscriptions = mockSubscriptions.map(s => s.id === Number(id) ? { ...s, ...data } : s);
      return mockSubscriptions.find(s => s.id === Number(id));
    }
  },
  
  updateStatus: async (id, newStatus) => {
    try {
       const response = await api.patch(`/subscriptions/${id}/status`, { status: newStatus });
       return response.data;
    } catch (e) {
       mockSubscriptions = mockSubscriptions.map(s => s.id === Number(id) ? { ...s, status: newStatus } : s);
       return mockSubscriptions.find(s => s.id === Number(id));
    }
  }
};
