import api from './axios';

let mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    customerId: 1,
    subscriptionId: 1,
    dueDate: '2026-06-01',
    issueDate: '2026-05-01',
    status: 'paid', // draft → confirmed → paid (or cancelled)
    lines: [
      { id: 101, product: 'Standard B2B SOW', qty: 10, unitPrice: 49.99, taxPercentage: 20, amount: 599.88 }
    ],
    subtotal: 499.90,
    taxTotal: 99.98,
    total: 599.88,
    amountPaid: 599.88
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0002',
    customerId: 2,
    subscriptionId: null,
    dueDate: '2025-01-01', // Overdue natively
    issueDate: '2024-12-01',
    status: 'confirmed',
    lines: [
      { id: 102, product: 'Hardware Starter Kit', qty: 5, unitPrice: 69.99, taxPercentage: 0, amount: 349.95 }
    ],
    subtotal: 349.95,
    taxTotal: 0,
    total: 349.95,
    amountPaid: 0
  }
];

export const invoicesApi = {
  getInvoices: async (params) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (e) {
      const { status = '' } = params || {};
      let filtered = mockInvoices;
      if (status) filtered = filtered.filter(i => i.status === status);
      return filtered;
    }
  },

  getInvoiceById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (e) {
      const inv = mockInvoices.find(i => i.id === Number(id));
      if (!inv) throw new Error("Invoice not found");
      return inv;
    }
  },

  createInvoice: async (data) => {
    try {
      const response = await api.post('/invoices', data);
      return response.data;
    } catch (e) {
      const newInv = { 
        id: Math.floor(Math.random() * 10000),
        invoiceNumber: `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'draft',
        amountPaid: 0,
        ...data 
      };
      mockInvoices.unshift(newInv);
      return newInv;
    }
  },

  updateStatus: async (id, newStatus) => {
    try {
       const response = await api.patch(`/invoices/${id}/status`, { status: newStatus });
       return response.data;
    } catch (e) {
       mockInvoices = mockInvoices.map(i => i.id === Number(id) ? { ...i, status: newStatus } : i);
       return mockInvoices.find(i => i.id === Number(id));
    }
  },

  updateAmountPaid: async (id, newPaid) => {
      mockInvoices = mockInvoices.map(i => {
           if (i.id === Number(id)) {
               const updated = { ...i, amountPaid: i.amountPaid + newPaid };
               if (updated.amountPaid >= updated.total) updated.status = 'paid';
               return updated;
           }
           return i;
      });
      return mockInvoices.find(i => i.id === Number(id));
  }
};
