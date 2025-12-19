import api from './api';

export const targetService = {
  /**
   * Get all monthly targets with optional filters
   * @param {Object} params - Query parameters (department_id, year, month, sort_by, sort_order)
   */
  getAll: async (params = {}) => {
    return api.get('/targets', { params });
  },

  /**
   * Get targets for a specific department
   * @param {number} departmentId - Department ID
   * @param {number} year - Optional year filter
   */
  getByDepartment: async (departmentId, year = null) => {
    const params = year ? { year } : {};
    return api.get(`/targets/department/${departmentId}`, { params });
  },

  /**
   * Get a specific monthly target
   * @param {number} departmentId - Department ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  getTarget: async (departmentId, year, month) => {
    return api.get(`/targets/${departmentId}/${year}/${month}`);
  },

  /**
   * Create or update a monthly target
   * @param {Object} data - { department_id, year, month, target_amount }
   */
  createOrUpdate: async (data) => {
    return api.post('/targets', data);
  },

  /**
   * Update a target by ID
   * @param {number} id - Target ID
   * @param {Object} data - { target_amount, year?, month? }
   */
  update: async (id, data) => {
    return api.put(`/targets/${id}`, data);
  },

  /**
   * Delete a target
   * @param {number} id - Target ID
   */
  delete: async (id) => {
    return api.delete(`/targets/${id}`);
  },

  /**
   * Bulk create/update targets for a department
   * @param {number} departmentId - Department ID
   * @param {number} year - Year
   * @param {Array} targets - Array of { month, target_amount }
   */
  bulkCreate: async (departmentId, year, targets) => {
    return api.post('/targets/bulk', {
      department_id: departmentId,
      year,
      targets
    });
  }
};

export default targetService;
