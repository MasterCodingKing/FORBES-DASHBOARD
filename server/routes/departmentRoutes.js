const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkModuleAccess, MODULES } = require('../middleware/permissionMiddleware');
const { auditMiddleware } = require('../middleware/auditMiddleware');

// All routes require authentication and departments module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.DEPARTMENTS));

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);

// Admin only routes
router.post('/', adminMiddleware, auditMiddleware('CREATE', 'Department'), departmentController.createDepartment);
router.put('/:id', adminMiddleware, auditMiddleware('UPDATE', 'Department'), departmentController.updateDepartment);
router.delete('/:id', adminMiddleware, auditMiddleware('DELETE', 'Department'), departmentController.deleteDepartment);

module.exports = router;
