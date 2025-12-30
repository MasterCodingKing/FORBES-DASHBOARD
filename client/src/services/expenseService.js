import api from './api';

export const expenseService = {
  getAll: async (params = {}) => {
    return api.get('/expenses', { params });
  },

  getById: async (id) => {
    return api.get(`/expenses/${id}`);
  },

  create: async (data) => {
    return api.post('/expenses', data);
  },

  createBulk: async (expenses) => {
    return api.post('/expenses/bulk', { expenses });
  },

  update: async (id, data) => {
    return api.put(`/expenses/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`/expenses/${id}`);
  },

  getCategories: async () => {
    return api.get('/expenses/categories');
  }
};

export default expenseService;
