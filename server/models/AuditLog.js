const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Action performed (e.g., CREATE, UPDATE, DELETE, LOGIN, LOGOUT)'
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Entity affected (e.g., Sale, Expense, User, Department)'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the affected entity'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the action'
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values before update'
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New values after update/create'
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = AuditLog;
