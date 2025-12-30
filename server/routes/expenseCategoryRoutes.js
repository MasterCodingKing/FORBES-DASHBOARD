const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermission, checkModuleAccess, PERMISSIONS, MODULES } = require('../middleware/permissionMiddleware');
const { auditMiddleware } = require('../middleware/auditMiddleware');

// All routes require authentication and expenses module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.EXPENSES));

// View categories
router.get('/', checkPermission(PERMISSIONS.VIEW_EXPENSES), expenseCategoryController.getCategories);
router.get('/:id', checkPermission(PERMISSIONS.VIEW_EXPENSES), expenseCategoryController.getCategory);

// Create categories
router.post('/', checkPermission(PERMISSIONS.CREATE_EXPENSES), auditMiddleware('CREATE', 'ExpenseCategory'), expenseCategoryController.createCategory);

// Update categories
router.put('/:id', checkPermission(PERMISSIONS.EDIT_EXPENSES), auditMiddleware('UPDATE', 'ExpenseCategory'), expenseCategoryController.updateCategory);

// Delete categories
router.delete('/:id', checkPermission(PERMISSIONS.DELETE_EXPENSES), auditMiddleware('DELETE', 'ExpenseCategory'), expenseCategoryController.deleteCategory);

module.exports = router;
