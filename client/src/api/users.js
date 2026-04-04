import api from './axios';

// Mock list
let mockUsers = [
  { id: 1, name: 'System Admin', email: 'admin@email.com', role: 'admin' },
  { id: 2, name: 'John Doe', email: 'john@email.com', role: 'user' },
  { id: 3, name: 'Alice Smith', email: 'alice@email.com', role: 'user' },
  { id: 4, name: 'Internal QA', email: 'qa@email.com', role: 'internalUser' },
];

export const usersApi = {
  getUsers: async (params) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (e) {
      console.warn("Mocking user fetch fallback");
      const { search = '', role = '', page = 1, limit = 10 } = params || {};
      
      let filtered = mockUsers.filter(u => 
        (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
        (role ? u.role === role : true)
      );
      
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      
      return { data: paginated, total, page, limit };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (e) {
      const newUser = { id: Math.floor(Math.random() * 10000), ...userData };
      mockUsers.unshift(newUser);
      return newUser;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (e) {
      mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...userData } : u);
      return mockUsers.find(u => u.id === id);
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (e) {
      mockUsers = mockUsers.filter(u => u.id !== id);
      return { success: true };
    }
  }
};
