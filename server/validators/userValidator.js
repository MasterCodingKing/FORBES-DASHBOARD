const { body } = require('express-validator');
const { User } = require('../models');

const createUserValidator = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .isLength({ max: 100 })
    .withMessage('First name cannot exceed 100 characters'),
  
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .isLength({ max: 100 })
    .withMessage('Last name cannot exceed 100 characters'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Username must be between 3 and 255 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { username: value } });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('confirm_password')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('is_admin')
    .optional()
    .isBoolean()
    .withMessage('is_admin must be a boolean')
];

const updateUserValidator = [
  body('first_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .isLength({ max: 100 })
    .withMessage('First name cannot exceed 100 characters'),
  
  body('last_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .isLength({ max: 100 })
    .withMessage('Last name cannot exceed 100 characters'),
  
  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isLength({ min: 3, max: 255 })
    .withMessage('Username must be between 3 and 255 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value, { req }) => {
      const existingUser = await User.findOne({ where: { username: value } });
      if (existingUser && existingUser.id !== parseInt(req.params.id)) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('confirm_password')
    .optional()
    .custom((value, { req }) => {
      if (req.body.password && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('is_admin')
    .optional()
    .isBoolean()
    .withMessage('is_admin must be a boolean')
];

module.exports = {
  createUserValidator,
  updateUserValidator
};
