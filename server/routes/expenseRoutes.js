const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createExpenseValidator } = require('../validators/expenseValidator');

// All routes require authentication
router.use(authMiddleware);

router.get('/categories', expenseController.getCategories);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', createExpenseValidator, validateRequest, expenseController.createExpense);
router.put('/:id', createExpenseValidator, validateRequest, expenseController.updateExpense);

// Delete requires admin
router.delete('/:id', adminMiddleware, expenseController.deleteExpense);

module.exports = router;
