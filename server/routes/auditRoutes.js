const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All audit routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// GET /api/audit/stats - Get audit statistics
router.get('/stats', auditController.getAuditStats);

// GET /api/audit - Get audit logs with filtering
router.get('/', auditController.getAuditLogs);

// GET /api/audit/:id - Get specific audit log
router.get('/:id', auditController.getAuditLogById);

module.exports = router;
