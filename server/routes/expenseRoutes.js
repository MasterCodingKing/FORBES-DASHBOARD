const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { checkPermission, checkModuleAccess, PERMISSIONS, MODULES } = require('../middleware/permissionMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { auditMiddleware } = require('../middleware/auditMiddleware');
const { createExpenseValidator } = require('../validators/expenseValidator');

// All routes require authentication and expenses module access
router.use(authMiddleware);
router.use(checkModuleAccess(MODULES.EXPENSES));

// View expenses
router.get('/categories', checkPermission(PERMISSIONS.VIEW_EXPENSES), expenseController.getCategories);
router.get('/', checkPermission(PERMISSIONS.VIEW_EXPENSES), expenseController.getExpenses);
router.get('/:id', checkPermission(PERMISSIONS.VIEW_EXPENSES), expenseController.getExpense);

// Create expenses
router.post('/', checkPermission(PERMISSIONS.CREATE_EXPENSES), createExpenseValidator, validateRequest, auditMiddleware('CREATE', 'Expense'), expenseController.createExpense);

// Update expenses
router.put('/:id', checkPermission(PERMISSIONS.EDIT_EXPENSES), createExpenseValidator, validateRequest, auditMiddleware('UPDATE', 'Expense'), expenseController.updateExpense);

// Delete expenses (requires delete permission or admin)
router.delete('/:id', checkPermission(PERMISSIONS.DELETE_EXPENSES), auditMiddleware('DELETE', 'Expense'), expenseController.deleteExpense);

module.exports = router;
