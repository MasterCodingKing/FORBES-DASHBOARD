const express = require('express');
const router = express.Router();
const projectionController = require('../controllers/projectionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkModuleAccess, MODULES } = require('../middleware/permissionMiddleware');
const { auditMiddleware } = require('../middleware/auditMiddleware');

// All routes require authentication and targets module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.TARGETS));

// Get all projections (with optional filters)
router.get('/', projectionController.getAllProjections);

// Get projections for a specific month and year
router.get('/:year/:month', projectionController.getProjectionsByMonth);

// Admin only routes
// Create or update a monthly projection
router.post('/', adminMiddleware, auditMiddleware('CREATE', 'Projection'), projectionController.createOrUpdateProjection);

// Bulk create projections for a month
router.post('/bulk', adminMiddleware, auditMiddleware('CREATE', 'Projection'), projectionController.bulkCreateProjections);

// Update a projection by ID
router.put('/:id', adminMiddleware, auditMiddleware('UPDATE', 'Projection'), projectionController.updateProjection);

// Delete a projection
router.delete('/:id', adminMiddleware, auditMiddleware('DELETE', 'Projection'), projectionController.deleteProjection);

module.exports = router;
