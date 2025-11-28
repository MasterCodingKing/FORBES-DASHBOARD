import api from './api';

export const departmentService = {
  getAll: async () => {
    return api.get('/departments');
  },

  getById: async (id) => {
    return api.get(`/departments/${id}`);
  },

  create: async (data) => {
    return api.post('/departments', data);
  },

  update: async (id, data) => {
    return api.put(`/departments/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`/departments/${id}`);
  }
};

export default departmentService;
