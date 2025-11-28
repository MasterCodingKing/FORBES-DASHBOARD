import api from './api';

export const salesService = {
  getAll: async (params = {}) => {
    return api.get('/sales', { params });
  },

  getById: async (id) => {
    return api.get(`/sales/${id}`);
  },

  create: async (data) => {
    return api.post('/sales', data);
  },

  update: async (id, data) => {
    return api.put(`/sales/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`/sales/${id}`);
  }
};

export default salesService;
