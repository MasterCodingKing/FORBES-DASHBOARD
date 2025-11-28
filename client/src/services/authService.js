import api from './api';

export const authService = {
  login: async (username, password, remember = false) => {
    return api.post('/auth/login', { username, password, remember });
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  me: async () => {
    return api.get('/auth/me');
  },

  refreshToken: async () => {
    return api.post('/auth/refresh');
  }
};

export default authService;
