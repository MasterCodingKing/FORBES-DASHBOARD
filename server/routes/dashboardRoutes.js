const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Admin only - main dashboard
router.get('/', adminMiddleware, dashboardController.getMainDashboard);

// All authenticated users - services dashboard
router.get('/services', dashboardController.getServicesDashboard);

// Helper routes
router.get('/revenue/:year', adminMiddleware, dashboardController.getYearlyRevenue);
router.get('/income/:year', adminMiddleware, dashboardController.getYearlyIncome);
router.get('/breakdown/:year/:month', adminMiddleware, dashboardController.getServiceBreakdown);
router.get('/yearly-breakdown/:year', adminMiddleware, dashboardController.getYearlyServiceBreakdown);

module.exports = router;
