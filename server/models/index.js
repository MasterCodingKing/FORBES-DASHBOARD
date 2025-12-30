const { sequelize } = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const Sale = require('./Sale');
const Expense = require('./Expense');
const ExpenseAccount = require('./ExpenseCategory');
const MonthlyTarget = require('./MonthlyTarget');
const MonthlyProjection = require('./MonthlyProjection');
const NOI = require('./NOI');
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

// MonthlyProjection associations
Department.hasMany(MonthlyProjection, {
  foreignKey: 'department_id',
  as: 'monthlyProjections',
  onDelete: 'CASCADE'
});

MonthlyProjection.belongsTo(Department, {
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
  ExpenseAccount,
  ExpenseCategory: ExpenseAccount, // Alias for backward compatibility
  MonthlyTarget,
  MonthlyProjection,
  NOI,
  Target: MonthlyTarget, // Alias for audit middleware
  Projection: MonthlyProjection, // Alias for audit middleware
  Auth: User, // Alias for auth-related audit logs
  AuditLog,
  syncDatabase
};
