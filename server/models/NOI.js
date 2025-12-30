const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NOI = sequelize.define('NOI', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  noi_amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'NOI amount must be a valid number'
      }
    }
  }
}, {
  tableName: 'noi',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['year', 'month'],
      name: 'unique_year_month_noi'
    }
  ]
});

module.exports = NOI;
