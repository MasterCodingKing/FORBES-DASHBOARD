const express = require('express');
const router = express.Router();
const noiController = require('../controllers/noiController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkModuleAccess, MODULES } = require('../middleware/permissionMiddleware');
const { auditMiddleware } = require('../middleware/auditMiddleware');

// All routes require authentication and targets module access (NOI is part of targets)
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.TARGETS));

// Get all NOI records (with optional filters)
router.get('/', noiController.getAllNOI);

// Get specific NOI by year and month
router.get('/:year/:month', noiController.getNOI);

// Admin only routes
// Create or update NOI
router.post('/', adminMiddleware, auditMiddleware('CREATE', 'NOI'), noiController.createOrUpdateNOI);

// Update NOI by ID
router.put('/:id', adminMiddleware, auditMiddleware('UPDATE', 'NOI'), noiController.updateNOI);

// Delete NOI
router.delete('/:id', adminMiddleware, auditMiddleware('DELETE', 'NOI'), noiController.deleteNOI);

module.exports = router;
