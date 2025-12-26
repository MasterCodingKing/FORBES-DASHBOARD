import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import DataTable from '../components/common/DataTable';
import userService from '../services/userService';
import { formatDate } from '../utils/formatters';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data?.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.delete(selectedUser.id);
      setSuccess('User deleted successfully');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 1) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500">Manage system users</p>
        </div>
        <Button onClick={() => navigate('/users/create')}>
          + Add User
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              header: 'ID',
              accessor: 'id'
            },
            {
              header: 'Username',
              accessor: 'username',
              render: (row) => (
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {row.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {row.username}
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: 'Full Name',
              accessor: 'first_name',
              render: (row) => `${row.first_name} ${row.last_name || ''}`
            },
            {
              header: 'Role',
              accessor: 'is_admin',
              render: (row) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {row.is_admin ? 'Admin' : 'User'}
                </span>
              )
            },
            {
              header: 'Created',
              accessor: 'createdAt',
              render: (row) => formatDate(row.created_at || row.createdAt)
            },
            {
              header: 'Actions',
              accessor: 'actions',
              sortable: false,
              render: (row) => (
                <div className="flex justify-center gap-2">
                  <Button
                    size="medium"
                    variant="secondary"
                    onClick={() => navigate(`/users/${row.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="medium"
                    variant="info"
                    onClick={() => navigate(`/users/${row.id}/permissions`)}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Permissions
                  </Button>
                  <Button
                    size="medium"
                    variant="danger"
                    onClick={() => handleDelete(row)}
                  >
                    Delete
                  </Button>
                </div>
              )
            }
          ]}
          data={users}
          defaultSortKey="id"
          defaultSortOrder="asc"
          emptyMessage="No users found"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteModalOpen(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete the user{' '}
                <span className="font-semibold">{selectedUser?.name}</span>?
              </p>
              <p className="text-sm text-red-600 mb-4">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
