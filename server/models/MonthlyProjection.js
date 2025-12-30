const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonthlyProjection = sequelize.define('MonthlyProjection', {
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
  avg_monthly: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Average monthly must be a non-negative number'
      }
    }
  },
  monthly_target: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Monthly target must be a non-negative number'
      }
    }
  }
}, {
  tableName: 'monthly_projections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['department_id', 'year', 'month'],
      name: 'unique_projection_dept_year_month'
    }
  ]
});

module.exports = MonthlyProjection;
