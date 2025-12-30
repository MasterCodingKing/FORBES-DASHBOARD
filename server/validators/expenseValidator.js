const { body } = require('express-validator');

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
    .isFloat({ min: 0, max: 999999999999.99 })
    .withMessage('Amount must be a positive number and less than 999,999,999,999.99'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters')
    // Category validation against dynamic expense_categories is done at the database level
];

module.exports = {
  createExpenseValidator
};
