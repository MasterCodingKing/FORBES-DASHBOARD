const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkModuleAccess, MODULES } = require('../middleware/permissionMiddleware');
const { auditMiddleware } = require('../middleware/auditMiddleware');

// All routes require authentication and targets module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.TARGETS));

// Get all targets (with optional filters)
router.get('/', targetController.getMonthlyTargets);

// Get targets for a specific department
router.get('/department/:departmentId', targetController.getDepartmentTargets);

// Get specific target by department, year, and month
router.get('/:departmentId/:year/:month', targetController.getMonthlyTarget);

// Admin only routes
// Create or update a monthly target
router.post('/', adminMiddleware, auditMiddleware('CREATE', 'Target'), targetController.createOrUpdateTarget);

// Bulk create targets for a department
router.post('/bulk', adminMiddleware, auditMiddleware('CREATE', 'Target'), targetController.bulkCreateTargets);

// Update a target by ID
router.put('/:id', adminMiddleware, auditMiddleware('UPDATE', 'Target'), targetController.updateTarget);

// Delete a target
router.delete('/:id', adminMiddleware, auditMiddleware('DELETE', 'Target'), targetController.deleteTarget);

module.exports = router;
