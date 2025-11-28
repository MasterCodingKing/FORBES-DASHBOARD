const dashboardService = require('../services/dashboardService');

/**
 * Get main dashboard data
 * GET /api/dashboard
 */
const getMainDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Fetch all dashboard data in parallel
    const [
      monthlyRevenue,
      monthlyIncome,
      serviceBreakdown,
      monthToMonth,
      ytdSales,
      ytdIncome
    ] = await Promise.all([
      dashboardService.getMonthlyRevenue(currentYear),
      dashboardService.getMonthlyIncome(currentYear),
      dashboardService.getServiceBreakdown(currentYear, currentMonth),
      dashboardService.getMonthToMonthComparison(),
      dashboardService.getYTDSalesComparison(),
      dashboardService.getYTDIncomeComparison()
    ]);

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        monthlyIncome,
        serviceBreakdown,
        monthToMonth,
        ytdSales,
        ytdIncome,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get services dashboard data
 * GET /api/dashboard/services
 */
const getServicesDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const {
      department_id,
      display_month = now.getMonth() + 1,
      display_year = now.getFullYear(),
      target_month = now.getMonth() + 1,
      target_year = now.getFullYear()
    } = req.query;

    if (!department_id) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }

    const data = await dashboardService.getServicesDashboardData(
      parseInt(department_id),
      parseInt(display_month),
      parseInt(display_year),
      parseInt(target_month),
      parseInt(target_year)
    );

    res.json({
      success: true,
      data: {
        ...data,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly revenue for a specific year
 * GET /api/dashboard/revenue/:year
 */
const getYearlyRevenue = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    const data = await dashboardService.getMonthlyRevenue(year);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service breakdown for a specific month
 * GET /api/dashboard/breakdown/:year/:month
 */
const getServiceBreakdown = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const data = await dashboardService.getServiceBreakdown(
      parseInt(year),
      parseInt(month)
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMainDashboard,
  getServicesDashboard,
  getYearlyRevenue,
  getServiceBreakdown
};
