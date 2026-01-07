/**
 * Permission checking middleware
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Admins have all permissions
    if (user.role === 'admin') {
      return next();
    }

    // Check if user has specific permission
    const permissions = user.permissions || {};
    
    if (!permissions[requiredPermission]) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${requiredPermission}`
      });
    }

    next();
  };
};

/**
 * Module access checking middleware
 * Checks if user is allowed to access a specific module
 */
const checkModuleAccess = (moduleName) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Admins have access to all modules
    if (user.role === 'admin') {
      return next();
    }

    // If allowed_modules is null or undefined, allow all modules (default behavior)
    const allowedModules = user.allowed_modules;
    if (!allowedModules || allowedModules.length === 0) {
      return next();
    }

    // Check if the module is in the allowed list
    if (!allowedModules.includes(moduleName)) {
      return res.status(403).json({
        success: false,
        message: `You don't have access to the ${moduleName} module`
      });
    }

    next();
  };
};

/**
 * Check if user is active
 */
const checkActive = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact an administrator.'
    });
  }

  next();
};

/**
 * Available permissions
 */
const PERMISSIONS = {
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

/**
 * Available modules for access control
 */
const MODULES = {
  DASHBOARD: 'dashboard',
  SALES: 'sales',
  EXPENSES: 'expenses',
  DEPARTMENTS: 'departments',
  REPORTS: 'reports',
  TARGETS: 'targets',
  USERS: 'users',
  AUDIT: 'audit'
};

/**
 * Available reports for access control
 */
const REPORTS = {
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

/**
 * Default permissions by role
 */
const DEFAULT_PERMISSIONS = {
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

module.exports = {
  checkPermission,
  checkModuleAccess,
  checkActive,
  PERMISSIONS,
  MODULES,
  REPORTS,
  DEFAULT_PERMISSIONS
};
