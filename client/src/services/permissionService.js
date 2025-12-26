import api from './api';

const permissionService = {
  /**
   * Get available permissions
   */
  getAvailablePermissions: async () => {
    const response = await api.get('/users/permissions/available');
    return response;
  },

  /**
   * Update user permissions
   */
  updateUserPermissions: async (userId, data) => {
    const response = await api.put(`/users/${userId}/permissions`, data);
    return response;
  }
};

export default permissionService;
