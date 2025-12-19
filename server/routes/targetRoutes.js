const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all targets (with optional filters)
router.get('/', targetController.getMonthlyTargets);

// Get targets for a specific department
router.get('/department/:departmentId', targetController.getDepartmentTargets);

// Get specific target by department, year, and month
router.get('/:departmentId/:year/:month', targetController.getMonthlyTarget);

// Admin only routes
// Create or update a monthly target
router.post('/', adminMiddleware, targetController.createOrUpdateTarget);

// Bulk create targets for a department
router.post('/bulk', adminMiddleware, targetController.bulkCreateTargets);

// Update a target by ID
router.put('/:id', adminMiddleware, targetController.updateTarget);

// Delete a target
router.delete('/:id', adminMiddleware, targetController.deleteTarget);

module.exports = router;
