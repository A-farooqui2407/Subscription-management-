import api from './axios';
import { unwrapDataFromResponse, unwrapPaginatedResponse } from './envelope';

export const paymentsApi = {
  getPayments: async (params) => {
    const response = await api.get('/payments', { params });
    return unwrapPaginatedResponse(response);
  },

  getPaymentsByInvoice: async (invoiceId) => {
    const response = await api.get('/payments', { params: { invoiceId } });
    const { rows } = unwrapPaginatedResponse(response);
    return rows;
  },

  /** Body from PaymentModal: { invoiceId, method, amount, date, ... } → POST /invoices/:id/payments */
  createPayment: async (pData) => {
    const { invoiceId, amount, method, date, paymentDate, notes } = pData;
    const methodMap = {
      'Bank Transfer': 'bank_transfer',
      Card: 'card',
      Cash: 'cash',
      UPI: 'upi',
    };
    const body = {
      paymentMethod: methodMap[method] || method,
      amount: Number(amount),
      paymentDate: (paymentDate || date || '').toString().slice(0, 10),
      notes: notes != null && notes !== '' ? String(notes) : undefined,
    };
    const response = await api.post(`/invoices/${invoiceId}/payments`, body);
    return unwrapDataFromResponse(response);
  },
};
