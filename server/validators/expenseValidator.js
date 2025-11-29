const { body } = require('express-validator');
const Expense = require('../models/Expense');

const createExpenseValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format'),
  
  body('category')
    .optional()
    .isIn(Expense.CATEGORIES)
    .withMessage('Invalid expense category')
];

module.exports = {
  createExpenseValidator
};
