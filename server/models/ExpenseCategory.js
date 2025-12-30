const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExpenseAccount = sequelize.define('ExpenseAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Account name already exists'
    },
    validate: {
      notEmpty: { msg: 'Account name is required' },
      len: {
        args: [1, 100],
        msg: 'Account name must be between 1 and 100 characters'
      }
    }
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: {
      msg: 'Account number already exists'
    },
    field: 'account_number'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'expense_categories',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: async (account) => {
      if (!account.accountNumber) {
        // Auto-generate account number
        const count = await ExpenseAccount.count();
        account.accountNumber = String(10000 + count).padStart(5, '0');
      }
    }
  }
});

module.exports = ExpenseAccount;
