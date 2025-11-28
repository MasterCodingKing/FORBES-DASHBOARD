const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createSaleValidator } = require('../validators/salesValidator');

// All routes require authentication
router.use(authMiddleware);

router.get('/', salesController.getSales);
router.get('/:id', salesController.getSale);
router.post('/', createSaleValidator, validateRequest, salesController.createSale);
router.put('/:id', createSaleValidator, validateRequest, salesController.updateSale);

// Delete requires admin
router.delete('/:id', adminMiddleware, salesController.deleteSale);

module.exports = router;
