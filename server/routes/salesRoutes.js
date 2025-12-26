const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkPermission, checkModuleAccess, PERMISSIONS, MODULES } = require('../middleware/permissionMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { auditMiddleware } = require('../middleware/auditMiddleware');
const { createSaleValidator } = require('../validators/salesValidator');

// All routes require authentication and sales module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.SALES));

// View sales
router.get('/', checkPermission(PERMISSIONS.VIEW_SALES), salesController.getSales);
router.get('/:id', checkPermission(PERMISSIONS.VIEW_SALES), salesController.getSale);

// Create sales
router.post('/', checkPermission(PERMISSIONS.CREATE_SALES), createSaleValidator, validateRequest, auditMiddleware('CREATE', 'Sale'), salesController.createSale);

// Update sales
router.put('/:id', checkPermission(PERMISSIONS.EDIT_SALES), createSaleValidator, validateRequest, auditMiddleware('UPDATE', 'Sale'), salesController.updateSale);

// Delete sales (requires delete permission or admin)
router.delete('/:id', checkPermission(PERMISSIONS.DELETE_SALES), auditMiddleware('DELETE', 'Sale'), salesController.deleteSale);

module.exports = router;
