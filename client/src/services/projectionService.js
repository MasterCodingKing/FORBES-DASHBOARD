import api from './api';

export const projectionService = {
  /**
   * Get all monthly projections with optional filters
   * @param {Object} params - Query parameters (year, month, department_id, sort_by, sort_order)
   */
  getAll: async (params = {}) => {
    return api.get('/projections', { params });
  },

  /**
   * Get projections for a specific month and year
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  getByMonth: async (year, month) => {
    return api.get(`/projections/${year}/${month}`);
  },

  /**
   * Create or update a monthly projection
   * @param {Object} data - { department_id, year, month, avg_monthly, monthly_target }
   */
  createOrUpdate: async (data) => {
    return api.post('/projections', data);
  },

  /**
   * Bulk create/update projections for a month
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {Array} projections - Array of { department_id, avg_monthly, monthly_target }
   */
  bulkCreate: async (year, month, projections) => {
    return api.post('/projections/bulk', {
      year,
      month,
      projections
    });
  },

  /**
   * Update a projection by ID
   * @param {number} id - Projection ID
   * @param {Object} data - { avg_monthly?, monthly_target?, year?, month? }
   */
  update: async (id, data) => {
    return api.put(`/projections/${id}`, data);
  },

  /**
   * Delete a projection
   * @param {number} id - Projection ID
   */
  delete: async (id) => {
    return api.delete(`/projections/${id}`);
  }
};

export default projectionService;
