const { body } = require('express-validator');

const createSaleValidator = [
  body('department_id')
    .notEmpty()
    .withMessage('Department is required')
    .isInt({ min: 1 })
    .withMessage('Invalid department'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  // Support both date and sale_date field names
  body(['date', 'sale_date'])
    .custom((value, { req }) => {
      const dateValue = req.body.date || req.body.sale_date;
      if (!dateValue) {
        throw new Error('Date is required');
      }
      return true;
    })
];

module.exports = {
  createSaleValidator
};
