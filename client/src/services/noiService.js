import api from './api';

export const noiService = {
  /**
   * Get all NOI records with optional filters
   * @param {Object} params - Query parameters (year, month, sort_by, sort_order)
   */
  getAll: async (params = {}) => {
    return api.get('/noi', { params });
  },

  /**
   * Get a specific NOI record
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  get: async (year, month) => {
    return api.get(`/noi/${year}/${month}`);
  },

  /**
   * Create or update NOI
   * @param {Object} data - { year, month, noi_amount }
   */
  createOrUpdate: async (data) => {
    return api.post('/noi', data);
  },

  /**
   * Update NOI by ID
   * @param {number} id - NOI ID
   * @param {Object} data - { noi_amount, year?, month? }
   */
  update: async (id, data) => {
    return api.put(`/noi/${id}`, data);
  },

  /**
   * Delete NOI
   * @param {number} id - NOI ID
   */
  delete: async (id) => {
    return api.delete(`/noi/${id}`);
  }
};

export default noiService;
