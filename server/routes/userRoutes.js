const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { auditMiddleware } = require('../middleware/auditMiddleware');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');

// All routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/permissions/available', userController.getAvailablePermissions);
router.get('/', userController.getUsers);
router.post('/', createUserValidator, validateRequest, auditMiddleware('CREATE', 'User'), userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', updateUserValidator, validateRequest, auditMiddleware('UPDATE', 'User'), userController.updateUser);
router.put('/:id/permissions', auditMiddleware('UPDATE', 'User'), userController.updateUserPermissions);
router.delete('/:id', auditMiddleware('DELETE', 'User'), userController.deleteUser);

module.exports = router;
