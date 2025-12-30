const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Legacy static categories - kept for backwards compatibility
// Now using dynamic expense_categories table
const EXPENSE_CATEGORIES = [
  'General',
  'Utilities',
  'Supplies',
  'Marketing',
  'Salaries',
  'Rent',
  'Equipment',
  'Travel',
  'Maintenance',
  'Other'
];

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: {
        args: [1, 255],
        msg: 'Description cannot exceed 255 characters'
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Amount is required' },
      isDecimal: { msg: 'Amount must be a valid number' },
      min: {
        args: [0],
        msg: 'Amount must be positive'
      }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Date is required' },
      isDate: { msg: 'Invalid date format' }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'General'
    // Category validation removed - now using dynamic expense_categories table
  }
}, {
  tableName: 'expenses'
});

// Keep for backwards compatibility but not used for validation
Expense.CATEGORIES = EXPENSE_CATEGORIES;

module.exports = Expense;
