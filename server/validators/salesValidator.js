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
    .isFloat({ min: 0, max: 999999999999.99 })
    .withMessage('Amount must be a positive number and less than 999,999,999,999.99'),
  
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
