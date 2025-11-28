const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');

// All routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', userController.getUsers);
router.post('/', createUserValidator, validateRequest, userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', updateUserValidator, validateRequest, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
