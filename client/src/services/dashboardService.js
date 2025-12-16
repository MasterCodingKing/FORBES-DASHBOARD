import api from './api';

export const dashboardService = {
  getMainDashboard: async () => {
    return api.get('/dashboard');
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
    return api.get(`/dashboard/breakdown/${year}/${month}`);
  },

  getYearlyServiceBreakdown: async (year) => {
    return api.get(`/dashboard/yearly-breakdown/${year}`);
  }
};

export default dashboardService;
