import api from './api';

export const dashboardService = {
  getMainDashboard: async (year = null, month = null) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/dashboard', { params });
  },

  getServicesDashboard: async (params) => {
    return api.get('/dashboard/services', { params });
  },

  getYearlyRevenue: async (year) => {
    return api.get(`/dashboard/revenue/${year}`);
  },

  getYearlyIncome: async (year) => {
    return api.get(`/dashboard/income/${year}`);
  },

  getServiceBreakdown: async (year, month) => {
    // Ensure valid year and month
    const validYear = year || new Date().getFullYear();
    const validMonth = month || (new Date().getMonth() + 1);
    return api.get(`/dashboard/breakdown/${validYear}/${validMonth}`);
  },

  getYearlyServiceBreakdown: async (year) => {
    return api.get(`/dashboard/yearly-breakdown/${year}`);
  }
};

export default dashboardService;
