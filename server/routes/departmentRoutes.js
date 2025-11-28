const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);

// Admin only routes
router.post('/', adminMiddleware, departmentController.createDepartment);
router.put('/:id', adminMiddleware, departmentController.updateDepartment);
router.delete('/:id', adminMiddleware, departmentController.deleteDepartment);

module.exports = router;
