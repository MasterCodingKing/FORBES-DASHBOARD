import api from './api';

export const userService = {
  getAll: async () => {
    return api.get('/users');
  },

  getById: async (id) => {
    return api.get(`/users/${id}`);
  },

  create: async (data) => {
    return api.post('/users', data);
  },

  update: async (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`/users/${id}`);
  }
};

export default userService;
