import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import permissionService from '../services/permissionService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { useToast } from '../components/common/Toast';
import { DEFAULT_PERMISSIONS, MODULES, REPORTS, REPORT_NAMES } from '../utils/permissions';

const UserPermissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [availableModules, setAvailableModules] = useState({});
  const [availableReports, setAvailableReports] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedRole, setSelectedRole] = useState('user');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userResponse, permissionsResponse] = await Promise.all([
        userService.getById(id),
        permissionService.getAvailablePermissions()
      ]);

      const userData = userResponse.data.user;
      setUser(userData);
      setSelectedRole(userData.role || 'user');
      setIsActive(userData.is_active !== false);
      setSelectedPermissions(userData.permissions || {});
      setSelectedModules(userData.allowed_modules || []);
      setSelectedReports(userData.allowed_reports || []);
      setAvailablePermissions(permissionsResponse.data.permissions);
      setAvailableModules(permissionsResponse.data.modules || MODULES);
      setAvailableReports(permissionsResponse.data.reports || REPORTS);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user data');
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Load default permissions for the role
    setSelectedPermissions(DEFAULT_PERMISSIONS[role] || {});
    // Reset modules and reports to all when changing role
    // This ensures a clean slate for the new role
    setSelectedModules([]);
    setSelectedReports([]);
  };

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleModuleToggle = (module) => {
    setSelectedModules(prev => {
      // If in "all allowed" mode, start with just this one module
      if (prev.length === 0) {
        return [module];
      }
      // Otherwise toggle normally
      if (prev.includes(module)) {
        return prev.filter(m => m !== module);
      } else {
        return [...prev, module];
      }
    });
  };

  const handleSelectAllModules = () => {
    // If currently in "all allowed" mode (empty), don't do anything
    // User needs to click on individual modules to start restricting
    if (selectedModules.length === 0) {
      return;
    }
    // If specific modules are selected, clear them to allow all
    setSelectedModules([]);
  };

  const handleReportToggle = (report) => {
    setSelectedReports(prev => {
      // If in "all allowed" mode, start with just this one report
      if (prev.length === 0) {
        return [report];
      }
      // Otherwise toggle normally
      if (prev.includes(report)) {
        return prev.filter(r => r !== report);
      } else {
        return [...prev, report];
      }
    });
  };

  const handleSelectAllReports = () => {
    // If currently in "all allowed" mode (empty), don't do anything
    // User needs to click on individual reports to start restricting
    if (selectedReports.length === 0) {
      return;
    }
    // If specific reports are selected, clear them to allow all
    setSelectedReports([]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await permissionService.updateUserPermissions(id, {
        role: selectedRole,
        permissions: selectedPermissions,
        is_active: isActive,
        allowed_modules: selectedModules.length > 0 ? selectedModules : null,
        allowed_reports: selectedReports.length > 0 ? selectedReports : null
      });

      setSuccess('User permissions updated successfully');
      toast.success('User permissions updated successfully');
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions');
      toast.error(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Group permissions by category
  const permissionCategories = {
    Dashboard: ['view_dashboard', 'view_reports'],
    Sales: ['view_sales', 'create_sales', 'edit_sales', 'delete_sales'],
    Expenses: ['view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses'],
    Departments: ['view_departments', 'manage_departments'],
    Users: ['view_users', 'manage_users'],
    Targets: ['view_targets', 'manage_targets'],
    Other: ['view_audit', 'export_data']
  };

  // Module descriptions
  const moduleDescriptions = {
    dashboard: 'Main dashboard and services dashboard',
    sales: 'Sales management and records',
    expenses: 'Expense tracking and management',
    departments: 'Department/Service management',
    reports: 'Reports and analytics',
    targets: 'Monthly targets management',
    users: 'User management (admin only)',
    audit: 'Audit trail and logs'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage User Permissions
        </h1>
        <p className="text-gray-500">
          {user?.first_name} {user?.last_name} ({user?.username})
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          className="mb-6"
        />
      )}

      <Card title="User Access Control">
        {/* Account Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-lg font-medium text-gray-700">
              Account Active
            </span>
          </label>
          <p className="mt-2 ml-8 text-sm text-gray-500">
            {isActive 
              ? 'User can access the system'
              : 'User account is deactivated and cannot log in'}
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['admin', 'user', 'viewer'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  selectedRole === role
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold capitalize">{role}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {role === 'admin' && 'Full access to everything'}
                  {role === 'user' && 'Can view and create data'}
                  {role === 'viewer' && 'Read-only access'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Module Access Control */}
        {selectedRole !== 'admin' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Module Access</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select which modules this user can access. If none are selected, user has access to all modules based on their permissions.
            </p>
            
            <div className="mb-3">
              <button
                onClick={handleSelectAllModules}
                disabled={selectedModules.length === 0}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedModules.length === 0
                    ? 'bg-green-100 text-green-700 border-2 border-green-500 opacity-50 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {selectedModules.length === 0 ? '✓ All Modules Allowed' : 'Clear Selection (Allow All)'}
              </button>
              {selectedModules.length === 0 && (
                <p className="mt-2 text-xs text-green-600">
                  Click on any module below to start restricting access
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(availableModules).map(([key, module]) => (
                <label
                  key={module}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModules.includes(module)
                      ? 'border-blue-500 bg-blue-50'
                      : selectedModules.length === 0
                      ? 'border-green-300 bg-green-50/50 hover:border-green-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module) || selectedModules.length === 0}
                    onChange={() => handleModuleToggle(module)}
                    className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {module}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {moduleDescriptions[module] || ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedModules.length > 0 && (
              <p className="mt-3 text-sm text-amber-600">
                ⚠️ User will ONLY have access to: {selectedModules.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Report Access Control */}
        {selectedRole !== 'admin' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Report Access</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select which reports this user can access. If none are selected, user has access to all reports.
            </p>
            
            <div className="mb-3">
              <button
                onClick={handleSelectAllReports}
                disabled={selectedReports.length === 0}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedReports.length === 0
                    ? 'bg-green-100 text-green-700 border-2 border-green-500 opacity-50 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {selectedReports.length === 0 ? '✓ All Reports Allowed' : 'Clear Selection (Allow All)'}
              </button>
              {selectedReports.length === 0 && (
                <p className="mt-2 text-xs text-green-600">
                  Click on any report below to start restricting access
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(availableReports).map(([key, reportId]) => (
                <label
                  key={reportId}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReports.includes(reportId)
                      ? 'border-blue-500 bg-blue-50'
                      : selectedReports.length === 0
                      ? 'border-green-300 bg-green-50/50 hover:border-green-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(reportId) || selectedReports.length === 0}
                    onChange={() => handleReportToggle(reportId)}
                    className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">
                      {REPORT_NAMES[reportId] || reportId}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedReports.length > 0 && (
              <p className="mt-3 text-sm text-amber-600">
                ⚠️ User will ONLY have access to: {selectedReports.map(r => REPORT_NAMES[r] || r).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Custom Permissions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Custom Permissions</h3>
          <p className="text-sm text-gray-500 mb-4">
            Customize individual permissions for fine-grained access control
          </p>

          <div className="space-y-6">
            {Object.entries(permissionCategories).map(([category, perms]) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perms.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions[perm] || false}
                        onChange={() => handlePermissionToggle(perm)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {perm.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserPermissions;
