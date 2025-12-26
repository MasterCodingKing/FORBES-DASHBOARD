import api from './api';

const auditService = {
  /**
   * Get audit logs with filtering
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/audit?${queryString}`);
    return response;
  },

  /**
   * Get audit statistics
   */
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/audit/stats?${queryString}`);
    return response;
  },

  /**
   * Get audit log by ID
   */
  getById: async (id) => {
    const response = await api.get(`/audit/${id}`);
    return response;
  }
};

export default auditService;
