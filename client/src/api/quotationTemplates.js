import api from './axios';

let mockTemplates = [
  {
    id: 1,
    name: 'Standard B2B SOW',
    validityDays: 30,
    planId: 1,
    lines: [
      { id: 101, productId: 1, variantId: 101, taxId: 1, qty: 10, unitPrice: 49.99 }
    ]
  },
  {
    id: 2,
    name: 'Hardware Starter Kit',
    validityDays: 14,
    planId: 2,
    lines: [
      { id: 102, productId: 2, variantId: 201, taxId: null, qty: 5, unitPrice: 69.99 },
      { id: 103, productId: 1, variantId: 102, taxId: 1, qty: 1, unitPrice: 499.00 }
    ]
  }
];

export const quotationTemplatesApi = {
  getTemplates: async () => {
    try {
      const response = await api.get('/quotation-templates');
      return response.data;
    } catch (e) {
      return mockTemplates;
    }
  },

  getTemplateById: async (id) => {
    try {
      const response = await api.get(`/quotation-templates/${id}`);
      return response.data;
    } catch (e) {
      const t = mockTemplates.find(x => x.id === Number(id));
      if (!t) throw new Error("Template not found");
      return t;
    }
  },

  createTemplate: async (data) => {
    try {
      const response = await api.post('/quotation-templates', data);
      return response.data;
    } catch (e) {
      const newTemplate = { id: Math.floor(Math.random() * 10000), ...data };
      mockTemplates.unshift(newTemplate);
      return newTemplate;
    }
  },

  updateTemplate: async (id, data) => {
    try {
      const response = await api.put(`/quotation-templates/${id}`, data);
      return response.data;
    } catch (e) {
      mockTemplates = mockTemplates.map(t => t.id === Number(id) ? { ...t, ...data } : t);
      return mockTemplates.find(t => t.id === Number(id));
    }
  },

  deleteTemplate: async (id) => {
    try {
      const response = await api.delete(`/quotation-templates/${id}`);
      return response.data;
    } catch (e) {
      mockTemplates = mockTemplates.filter(t => t.id !== Number(id));
      return { success: true };
    }
  }
};
