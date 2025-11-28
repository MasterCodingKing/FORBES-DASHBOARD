const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { loginValidator } = require('../validators/authValidator');

// Public routes
router.post('/login', loginValidator, validateRequest, authController.login);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.post('/refresh', authMiddleware, authController.refreshToken);

module.exports = router;
