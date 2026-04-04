import api from './axios';

// Mock list
let mockProducts = [
  { 
    id: 1, 
    name: 'Enterprise Cloud Hosting', 
    type: 'Service', 
    salesPrice: 499.99, 
    costPrice: 200,
    variants: [
      { id: 101, attribute: 'Storage', value: '1TB', extraPrice: 0 },
      { id: 102, attribute: 'Storage', value: '5TB', extraPrice: 150 },
    ]
  },
  { 
    id: 2, 
    name: 'Wireless Controller V2', 
    type: 'Physical', 
    salesPrice: 69.99, 
    costPrice: 25,
    variants: [
      { id: 201, attribute: 'Color', value: 'Carbon Black', extraPrice: 0 },
      { id: 202, attribute: 'Color', value: 'Lunar White', extraPrice: 0 },
      { id: 203, attribute: 'Color', value: 'Ruby Red', extraPrice: 5 },
    ]
  },
];

export const productsApi = {
  getProducts: async (params) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (e) {
      const { search = '', type = '', page = 1, limit = 10 } = params || {};
      
      let filtered = mockProducts.filter(p => 
        (p.name.toLowerCase().includes(search.toLowerCase())) &&
        (type ? p.type.toLowerCase() === type.toLowerCase() : true)
      );
      
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      
      return { data: paginated, total, page, limit };
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (e) {
      const product = mockProducts.find(p => p.id === Number(id));
      if (!product) throw new Error("Product not found");
      return product;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (e) {
      const newProduct = { 
        id: Math.floor(Math.random() * 10000), 
        ...productData, 
        variants: [] 
      };
      mockProducts.unshift(newProduct);
      return newProduct;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (e) {
      mockProducts = mockProducts.map(p => p.id === Number(id) ? { ...p, ...productData } : p);
      return mockProducts.find(p => p.id === Number(id));
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (e) {
      mockProducts = mockProducts.filter(p => p.id !== Number(id));
      return { success: true };
    }
  },

  // Variants mapped onto Product locally
  createVariant: async (productId, variantData) => {
    try {
      const response = await api.post(`/products/${productId}/variants`, variantData);
      return response.data;
    } catch (e) {
      const newVariant = { id: Math.floor(Math.random() * 10000), ...variantData };
      const pIdx = mockProducts.findIndex(p => p.id === Number(productId));
      mockProducts[pIdx].variants.push(newVariant);
      return newVariant;
    }
  },

  updateVariant: async (productId, variantId, variantData) => {
    try {
      const response = await api.put(`/products/${productId}/variants/${variantId}`, variantData);
      return response.data;
    } catch (e) {
      const pIdx = mockProducts.findIndex(p => p.id === Number(productId));
      mockProducts[pIdx].variants = mockProducts[pIdx].variants.map(v => 
        v.id === Number(variantId) ? { ...v, ...variantData } : v
      );
      return mockProducts[pIdx].variants.find(v => v.id === Number(variantId));
    }
  },

  deleteVariant: async (productId, variantId) => {
    try {
      const response = await api.delete(`/products/${productId}/variants/${variantId}`);
      return response.data;
    } catch (e) {
      const pIdx = mockProducts.findIndex(p => p.id === Number(productId));
      mockProducts[pIdx].variants = mockProducts[pIdx].variants.filter(v => v.id !== Number(variantId));
      return { success: true };
    }
  }
};
