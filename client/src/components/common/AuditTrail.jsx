import { useState, useEffect } from 'react';
import auditService from '../../services/auditService';
import Card from '../common/Card';
import Table from '../common/Table';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const AuditTrail = () => {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
    entity: ''
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [filters, isAdmin]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAll(filters);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <Card title="Audit Trail">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            <strong>Access Denied:</strong> You don't have permission to view the audit trail. 
            Only administrators can access this feature.
          </p>
        </div>
      </Card>
    );
  }

  const columns = [
    { 
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (row) => formatDateTime(row.createdAt),
      className: 'text-sm'
    },
    { 
      header: 'User', 
      accessor: 'username',
      className: 'font-medium'
    },
    { 
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          row.action === 'CREATE' ? 'bg-green-100 text-green-800' :
          row.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
          row.action === 'DELETE' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.action}
        </span>
      )
    },
    { 
      header: 'Entity', 
      accessor: 'entity',
      className: 'font-medium'
    },
    { 
      header: 'Description', 
      accessor: 'description',
      className: 'text-sm text-gray-600'
    },
    { 
      header: 'IP Address', 
      accessor: 'ip_address',
      className: 'text-xs text-gray-500'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div>
      <Card title="Audit Trail">
        {/* Filters */}
        <div className="mb-4 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity
            </label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
            >
              <option value="">All Entities</option>
              <option value="Sale">Sale</option>
              <option value="Expense">Expense</option>
              <option value="User">User</option>
              <option value="Department">Department</option>
              <option value="Target">Target</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per Page
            </label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <Table columns={columns} data={logs} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AuditTrail;
