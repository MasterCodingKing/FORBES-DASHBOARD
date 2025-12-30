import api from './api';

export const expenseCategoryService = {
  getAll: async (params = {}) => {
    return api.get('/expense-categories', { params });
  },

  getById: async (id) => {
    return api.get(`/expense-categories/${id}`);
  },

  create: async (data) => {
    return api.post('/expense-categories', data);
  },

  update: async (id, data) => {
    return api.put(`/expense-categories/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`/expense-categories/${id}`);
  }
};

export default expenseCategoryService;
