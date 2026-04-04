import api from './axios';

let mockPayments = [
  {
    id: 1,
    paymentNumber: 'PAY-2026-0001',
    invoiceId: 1,
    customerId: 1,
    method: 'Bank Transfer',
    amount: 599.88,
    date: '2026-05-02'
  }
];

export const paymentsApi = {
  getPayments: async (params) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (e) {
      const { method = '' } = params || {};
      let filtered = mockPayments;
      if (method) filtered = filtered.filter(p => p.method === method);
      return filtered;
    }
  },

  getPaymentsByInvoice: async (invoiceId) => {
     try {
         const response = await api.get(`/invoices/${invoiceId}/payments`);
         return response.data;
     } catch (e) {
         return mockPayments.filter(p => p.invoiceId === Number(invoiceId));
     }
  },

  createPayment: async (data) => {
    try {
      const response = await api.post('/payments', data);
      return response.data;
    } catch (e) {
      const newPayment = { 
        id: Math.floor(Math.random() * 10000),
        paymentNumber: `PAY-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        ...data 
      };
      mockPayments.unshift(newPayment);
      return newPayment;
    }
  }
};
