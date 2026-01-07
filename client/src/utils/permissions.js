// Available permissions
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  
  // Sales
  VIEW_SALES: 'view_sales',
  CREATE_SALES: 'create_sales',
  EDIT_SALES: 'edit_sales',
  DELETE_SALES: 'delete_sales',
  
  // Expenses
  VIEW_EXPENSES: 'view_expenses',
  CREATE_EXPENSES: 'create_expenses',
  EDIT_EXPENSES: 'edit_expenses',
  DELETE_EXPENSES: 'delete_expenses',
  
  // Departments
  VIEW_DEPARTMENTS: 'view_departments',
  MANAGE_DEPARTMENTS: 'manage_departments',
  
  // Users
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // Targets
  VIEW_TARGETS: 'view_targets',
  MANAGE_TARGETS: 'manage_targets',
  
  // Audit
  VIEW_AUDIT: 'view_audit',
  
  // Export
  EXPORT_DATA: 'export_data'
};

// Available modules for access control
export const MODULES = {
  DASHBOARD: 'dashboard',
  SALES: 'sales',
  EXPENSES: 'expenses',
  DEPARTMENTS: 'departments',
  REPORTS: 'reports',
  TARGETS: 'targets',
  USERS: 'users',
  AUDIT: 'audit'
};

// Available reports for access control
export const REPORTS = {
  DASHBOARD_SUMMARY: 'dashboard-summary',
  MONTHLY_REVENUE: 'monthly-revenue',
  MONTHLY_INCOME: 'monthly-income',
  MONTH_TO_MONTH: 'month-to-month',
  YTD_SALES: 'ytd-sales',
  YTD_INCOME: 'ytd-income',
  MONTHLY_PROJECTION: 'monthly-projection',
  MONTHLY_SERVICE: 'monthly-service',
  MONTHLY_EXPENSE: 'monthly-expense'
};

// Report display names for UI
export const REPORT_NAMES = {
  'dashboard-summary': 'Dashboard Summary',
  'monthly-revenue': 'Monthly Revenue',
  'monthly-income': 'Monthly Income',
  'month-to-month': 'Month to Month Comparative',
  'ytd-sales': 'Year to Date - Sales',
  'ytd-income': 'Year to Date - Income',
  'monthly-projection': 'Monthly Projection',
  'monthly-service': 'Monthly Service Breakdown',
  'monthly-expense': 'Monthly Expense Report'
};

// Default permissions by role
export const DEFAULT_PERMISSIONS = {
  admin: Object.keys(PERMISSIONS).reduce((acc, key) => {
    acc[PERMISSIONS[key]] = true;
    return acc;
  }, {}),
  
  user: {
    [PERMISSIONS.VIEW_DASHBOARD]: true,
    [PERMISSIONS.VIEW_REPORTS]: true,
    [PERMISSIONS.VIEW_SALES]: true,
    [PERMISSIONS.CREATE_SALES]: true,
    [PERMISSIONS.EDIT_SALES]: true,
    [PERMISSIONS.VIEW_EXPENSES]: true,
    [PERMISSIONS.CREATE_EXPENSES]: true,
    [PERMISSIONS.EDIT_EXPENSES]: true,
    [PERMISSIONS.VIEW_DEPARTMENTS]: true,
    [PERMISSIONS.VIEW_TARGETS]: true,
    [PERMISSIONS.EXPORT_DATA]: true
  },
  
  viewer: {
    [PERMISSIONS.VIEW_DASHBOARD]: true,
    [PERMISSIONS.VIEW_REPORTS]: true,
    [PERMISSIONS.VIEW_SALES]: true,
    [PERMISSIONS.VIEW_EXPENSES]: true,
    [PERMISSIONS.VIEW_DEPARTMENTS]: true,
    [PERMISSIONS.VIEW_TARGETS]: true
  }
};

// Check if user has permission
export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'admin' || user.is_admin) return true;
  if (!user.is_active) return false;
  
  const permissions = user.permissions || {};
  return permissions[permission] === true;
};

// Check multiple permissions (user must have all)
export const hasAllPermissions = (user, ...permissions) => {
  return permissions.every(perm => hasPermission(user, perm));
};

// Check multiple permissions (user must have at least one)
export const hasAnyPermission = (user, ...permissions) => {
  return permissions.some(perm => hasPermission(user, perm));
};

// Check if user has access to a specific module
export const hasModuleAccess = (user, module) => {
  if (!user) return false;
  if (user.role === 'admin' || user.is_admin) return true;
  if (!user.is_active) return false;
  
  // If allowed_modules is not set or empty, allow all modules
  const allowedModules = user.allowed_modules;
  if (!allowedModules || allowedModules.length === 0) return true;
  
  return allowedModules.includes(module);
};

// Get list of modules user can access
export const getUserAllowedModules = (user) => {
  if (!user) return [];
  if (user.role === 'admin' || user.is_admin) return Object.values(MODULES);
  if (!user.is_active) return [];
  
  const allowedModules = user.allowed_modules;
  if (!allowedModules || allowedModules.length === 0) return Object.values(MODULES);
  
  return allowedModules;
};

// Check if user has access to a specific report
export const hasReportAccess = (user, reportId) => {
  if (!user) return false;
  if (user.role === 'admin' || user.is_admin) return true;
  if (!user.is_active) return false;
  
  // If allowed_reports is not set or empty, allow all reports
  const allowedReports = user.allowed_reports;
  if (!allowedReports || allowedReports.length === 0) return true;
  
  return allowedReports.includes(reportId);
};

// Get list of reports user can access
export const getUserAllowedReports = (user) => {
  if (!user) return [];
  if (user.role === 'admin' || user.is_admin) return Object.values(REPORTS);
  if (!user.is_active) return [];
  
  const allowedReports = user.allowed_reports;
  if (!allowedReports || allowedReports.length === 0) return Object.values(REPORTS);
  
  return allowedReports;
};
