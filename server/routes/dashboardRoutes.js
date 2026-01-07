const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkPermission, checkModuleAccess, PERMISSIONS, MODULES } = require('../middleware/permissionMiddleware');

// All routes require authentication and dashboard module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.DASHBOARD));

// Admin only - main dashboard
router.get('/', adminMiddleware, dashboardController.getMainDashboard);

// All authenticated users with view_dashboard permission - services dashboard
router.get('/services', checkPermission(PERMISSIONS.VIEW_DASHBOARD), dashboardController.getServicesDashboard);

// Helper routes - require view_reports permission
router.get('/revenue/:year', checkPermission(PERMISSIONS.VIEW_REPORTS), dashboardController.getYearlyRevenue);
router.get('/income/:year', checkPermission(PERMISSIONS.VIEW_REPORTS), dashboardController.getYearlyIncome);
router.get('/breakdown/:year/:month', checkPermission(PERMISSIONS.VIEW_REPORTS), dashboardController.getServiceBreakdown);
router.get('/yearly-breakdown/:year', checkPermission(PERMISSIONS.VIEW_REPORTS), dashboardController.getYearlyServiceBreakdown);
router.get('/expense-breakdown/:year', checkPermission(PERMISSIONS.VIEW_REPORTS), dashboardController.getExpenseBreakdown);

module.exports = router;
