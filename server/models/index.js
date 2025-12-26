const { sequelize } = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const Sale = require('./Sale');
const Expense = require('./Expense');
const MonthlyTarget = require('./MonthlyTarget');
const AuditLog = require('./AuditLog');

// Define associations
Department.hasMany(Sale, {
  foreignKey: 'department_id',
  as: 'sales',
  onDelete: 'CASCADE'
});

Sale.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

// MonthlyTarget associations
Department.hasMany(MonthlyTarget, {
  foreignKey: 'department_id',
  as: 'monthlyTargets',
  onDelete: 'CASCADE'
});

MonthlyTarget.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

// Sync all models with database
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Department,
  Sale,
  Expense,
  MonthlyTarget,
  Target: MonthlyTarget, // Alias for audit middleware
  Auth: User, // Alias for auth-related audit logs
  AuditLog,
  syncDatabase
};
