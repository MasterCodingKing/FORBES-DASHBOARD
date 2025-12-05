const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: {
        args: [0],
        msg: 'Target must be a positive number'
      }
    }
  }
}, {
  tableName: 'departments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Department;
