const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonthlyTarget = sequelize.define('MonthlyTarget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [2000],
        msg: 'Year must be 2000 or later'
      },
      max: {
        args: [2100],
        msg: 'Year must be 2100 or earlier'
      }
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Month must be between 1 and 12'
      },
      max: {
        args: [12],
        msg: 'Month must be between 1 and 12'
      }
    }
  },
  target_amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Target amount must be a positive number'
      }
    }
  },
  noi_amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'NOI amount must be a non-negative number'
      }
    }
  }
}, {
  tableName: 'monthly_targets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['department_id', 'year', 'month'],
      name: 'unique_department_month_year'
    }
  ]
});

module.exports = MonthlyTarget;
