import { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import targetService from '../services/targetService';
import noiService from '../services/noiService';
import departmentService from '../services/departmentService';
import { formatCurrency } from '../utils/formatters';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const getMonthName = (month) => MONTHS.find(m => m.value === month)?.label || '';

const MonthlyTargets = () => {
  const [targets, setTargets] = useState([]);
  const [nois, setNois] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noiLoading, setNoiLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter state
  const currentDate = new Date();
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortBy, setSortBy] = useState('year');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('targets'); // 'targets' or 'noi'

  // Form state
  const [formData, setFormData] = useState({
    department_id: '',
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    target_amount: ''
  });
  const [noiFormData, setNoiFormData] = useState({
    department_id: '',
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    noi_amount: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [noiFormErrors, setNoiFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [noiModalOpen, setNoiModalOpen] = useState(false);
  const [editNoiModalOpen, setEditNoiModalOpen] = useState(false);
  const [selectedNoiTarget, setSelectedNoiTarget] = useState(null);
  const [deleteNoiModalOpen, setDeleteNoiModalOpen] = useState(false);

  // Generate year options (current year - 5 to current year + 2)
  const yearOptions = [];
  for (let y = currentDate.getFullYear() - 5; y <= currentDate.getFullYear() + 2; y++) {
    yearOptions.push(y);
  }

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data?.departments || []);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadTargets = async () => {
    try {
      setLoading(true);
      const params = {
        sort_by: sortBy,
        sort_order: sortOrder
      };
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;
      if (filterDepartment) params.department_id = filterDepartment;

      const response = await targetService.getAll(params);
      setTargets(response.data?.targets || []);
    } catch (err) {
      console.error('Error loading targets:', err);
      setError('Failed to load monthly targets');
    } finally {
      setLoading(false);
    }
  };

  const loadNOI = async () => {
    try {
      setNoiLoading(true);
      const params = {
        sort_by: sortBy,
        sort_order: sortOrder
      };
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;

      const response = await noiService.getAll(params);
      setNois(response.data?.nois || []);
    } catch (err) {
      console.error('Error loading NOI:', err);
      setError('Failed to load NOI data');
    } finally {
      setNoiLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'targets') {
      loadTargets();
    } else {
      loadNOI();
    }
  }, [filterYear, filterMonth, filterDepartment, sortBy, sortOrder, activeTab]);

  const resetForm = () => {
    setFormData({
      department_id: '',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      target_amount: ''
    });
    setFormErrors({});
  };

  const resetNoiForm = () => {
    setNoiFormData({
      department_id: '',
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      noi_amount: ''
    });
    setNoiFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddModalOpen(true);
  };

  const handleOpenEdit = (target) => {
    setSelectedTarget(target);
    setFormData({
      department_id: target.department_id,
      year: target.year,
      month: target.month,
      target_amount: target.target_amount?.toString() || ''
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (target) => {
    setSelectedTarget(target);
    setDeleteModalOpen(true);
  };

  const handleOpenAddNoi = () => {
    resetNoiForm();
    setNoiModalOpen(true);
  };

  const handleOpenEditNoi = (target) => {
    setSelectedNoiTarget(target);
    setNoiFormData({
      department_id: target.department_id,
      year: target.year,
      month: target.month,
      noi_amount: target.noi_amount?.toString() || ''
    });
    setNoiFormErrors({});
    setEditNoiModalOpen(true);
  };

  const handleOpenDeleteNoi = (target) => {
    setSelectedNoiTarget(target);
    setDeleteNoiModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.department_id) {
      errors.department_id = 'Service is required';
    }
    if (!formData.year) {
      errors.year = 'Year is required';
    }
    if (!formData.month) {
      errors.month = 'Month is required';
    }
    if (!formData.target_amount || isNaN(parseFloat(formData.target_amount))) {
      errors.target_amount = 'Valid target amount is required';
    }
    if (parseFloat(formData.target_amount) < 0) {
      errors.target_amount = 'Target amount must be positive';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateNoiForm = () => {
    const errors = {};
    if (!noiFormData.year) {
      errors.year = 'Year is required';
    }
    if (!noiFormData.month) {
      errors.month = 'Month is required';
    }
    if (!noiFormData.noi_amount || isNaN(parseFloat(noiFormData.noi_amount))) {
      errors.noi_amount = 'Valid NOI amount is required';
    }
    if (parseFloat(noiFormData.noi_amount) < 0) {
      errors.noi_amount = 'NOI amount must be positive';
    }
    setNoiFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      await targetService.createOrUpdate({
        department_id: parseInt(formData.department_id),
        year: parseInt(formData.year),
        month: parseInt(formData.month),
        target_amount: parseFloat(formData.target_amount)
      });
      setSuccess('Monthly target saved successfully');
      setAddModalOpen(false);
      resetForm();
      loadTargets();
    } catch (err) {
      console.error('Error saving target:', err);
      setError(err.response?.data?.message || 'Failed to save target');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      await targetService.update(selectedTarget.id, {
        target_amount: parseFloat(formData.target_amount),
        year: parseInt(formData.year),
        month: parseInt(formData.month)
      });
      setSuccess('Monthly target updated successfully');
      setEditModalOpen(false);
      setSelectedTarget(null);
      resetForm();
      loadTargets();
    } catch (err) {
      console.error('Error updating target:', err);
      setError(err.response?.data?.message || 'Failed to update target');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddNoi = async (e) => {
    e.preventDefault();
    if (!validateNoiForm()) return;

    try {
      setFormLoading(true);
      await noiService.createOrUpdate({
        year: parseInt(noiFormData.year),
        month: parseInt(noiFormData.month),
        noi_amount: parseFloat(noiFormData.noi_amount)
      });
      setSuccess('NOI amount saved successfully');
      setNoiModalOpen(false);
      resetNoiForm();
      loadNOI();
    } catch (err) {
      console.error('Error saving NOI:', err);
      setError(err.response?.data?.message || 'Failed to save NOI amount');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateNoi = async (e) => {
    e.preventDefault();
    if (!validateNoiForm()) return;

    try {
      setFormLoading(true);
      await noiService.update(selectedNoiTarget.id, {
        noi_amount: parseFloat(noiFormData.noi_amount),
        year: parseInt(noiFormData.year),
        month: parseInt(noiFormData.month)
      });
      setSuccess('NOI amount updated successfully');
      setEditNoiModalOpen(false);
      setSelectedNoiTarget(null);
      resetNoiForm();
      loadNOI();
    } catch (err) {
      console.error('Error updating NOI:', err);
      setError(err.response?.data?.message || 'Failed to update NOI amount');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await targetService.delete(selectedTarget.id);
      setSuccess('Monthly target deleted successfully');
      setDeleteModalOpen(false);
      setSelectedTarget(null);
      loadTargets();
    } catch (err) {
      console.error('Error deleting target:', err);
      setError(err.response?.data?.message || 'Failed to delete target');
    }
  };

  const handleDeleteNoi = async () => {
    try {
      await noiService.delete(selectedNoiTarget.id);
      setSuccess('NOI amount deleted successfully');
      setDeleteNoiModalOpen(false);
      setSelectedNoiTarget(null);
      loadNOI();
    } catch (err) {
      console.error('Error deleting NOI:', err);
      setError(err.response?.data?.message || 'Failed to delete NOI amount');
    }
  };

  const clearFilters = () => {
    setFilterYear('');
    setFilterMonth('');
    setFilterDepartment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monthly Targets & NOI</h1>
          <p className="text-gray-500">Manage monthly sales targets and Net Operating Income for each service</p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('targets')}
            className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
              activeTab === 'targets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sales Targets
          </button>
          <button
            onClick={() => setActiveTab('noi')}
            className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
              activeTab === 'noi'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            NOI (Net Operating Income)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="year">Year/Month</option>
              <option value="department">Service</option>
              <option value="target">Target Amount</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={activeTab === 'targets' ? handleOpenAdd : handleOpenAddNoi}>
            + Add {activeTab === 'targets' ? 'Target' : 'NOI'}
          </Button>
        </div>
      </div>

      {/* Targets Tab */}
      {activeTab === 'targets' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: 'Service',
                  accessor: 'department.name',
                  render: (row) => row.department?.name || 'Unknown'
                },
                {
                  header: 'Year',
                  accessor: 'year'
                },
                {
                  header: 'Month',
                  accessor: 'month',
                  render: (row) => getMonthName(row.month)
                },
                {
                  header: 'Target Amount',
                  accessor: 'target_amount',
                  render: (row) => formatCurrency(row.target_amount)
                },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  sortable: false,
                  render: (row) => (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        size="medium"
                        onClick={() => handleOpenEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="medium"
                        onClick={() => handleOpenDelete(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  )
                }
              ]}
              data={targets}
              defaultSortKey="year"
              defaultSortOrder="desc"
              emptyMessage="No monthly targets found. Add a target to get started."
            />
          )}
        </>
      )}

      {/* NOI Tab */}
      {activeTab === 'noi' && (
        <>
          {noiLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: 'Year',
                  accessor: 'year'
                },
                {
                  header: 'Month',
                  accessor: 'month',
                  render: (row) => getMonthName(row.month)
                },
                {
                  header: 'NOI Amount',
                  accessor: 'noi_amount',
                  render: (row) => formatCurrency(row.noi_amount || 0)
                },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  sortable: false,
                  render: (row) => (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        size="medium"
                        onClick={() => handleOpenEditNoi(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="medium"
                        onClick={() => handleOpenDeleteNoi(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  )
                }
              ]}
              data={nois}
              defaultSortKey="year"
              defaultSortOrder="desc"
              emptyMessage="No NOI data found. Add NOI to get started."
            />
          )}
        </>
      )}

      {/* Add Target Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Monthly Target">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.department_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a service</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {formErrors.department_id && (
              <p className="text-red-500 text-sm mt-1">{formErrors.department_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {formErrors.year && (
                <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.month ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {formErrors.month && (
                <p className="text-red-500 text-sm mt-1">{formErrors.month}</p>
              )}
            </div>
          </div>

          <Input
            label="Target Amount *"
            name="target_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.target_amount}
            onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
            error={formErrors.target_amount}
            placeholder="0.00"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add NOI Modal */}
      <Modal isOpen={noiModalOpen} onClose={() => setNoiModalOpen(false)} title="Add NOI (Net Operating Income)">
        <form onSubmit={handleAddNoi} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enter the monthly NOI amount for your company
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={noiFormData.year}
                onChange={(e) => setNoiFormData(prev => ({ ...prev, year: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  noiFormErrors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {noiFormErrors.year && (
                <p className="text-red-500 text-sm mt-1">{noiFormErrors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                value={noiFormData.month}
                onChange={(e) => setNoiFormData(prev => ({ ...prev, month: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  noiFormErrors.month ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {noiFormErrors.month && (
                <p className="text-red-500 text-sm mt-1">{noiFormErrors.month}</p>
              )}
            </div>
          </div>

          <Input
            label="NOI Amount *"
            name="noi_amount"
            type="number"
            step="0.01"
            min="0"
            max="999999999999.99"
            value={noiFormData.noi_amount}
            onChange={(e) => setNoiFormData(prev => ({ ...prev, noi_amount: e.target.value }))}
            error={noiFormErrors.noi_amount}
            placeholder="0.00"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setNoiModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save NOI
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Target Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Monthly Target">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <input
              type="text"
              value={departments.find(d => d.id === formData.department_id)?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Target Amount *"
            name="target_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.target_amount}
            onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
            error={formErrors.target_amount}
            placeholder="0.00"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Update Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit NOI Modal */}
      <Modal isOpen={editNoiModalOpen} onClose={() => setEditNoiModalOpen(false)} title="Edit NOI (Net Operating Income)">
        <form onSubmit={handleUpdateNoi} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Update the NOI amount for the selected month
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={noiFormData.year}
                onChange={(e) => setNoiFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                value={noiFormData.month}
                onChange={(e) => setNoiFormData(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="NOI Amount *"
            name="noi_amount"
            type="number"
            step="0.01"
            min="0"
            max="999999999999.99"
            value={noiFormData.noi_amount}
            onChange={(e) => setNoiFormData(prev => ({ ...prev, noi_amount: e.target.value }))}
            error={noiFormErrors.noi_amount}
            placeholder="0.00"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditNoiModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Update NOI
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the monthly target for{' '}
            <span className="font-semibold">{selectedTarget?.department?.name}</span> in{' '}
            <span className="font-semibold">{getMonthName(selectedTarget?.month)} {selectedTarget?.year}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete NOI Confirmation Modal */}
      <Modal
        isOpen={deleteNoiModalOpen}
        onClose={() => setDeleteNoiModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the NOI amount for{' '}
            <span className="font-semibold">{getMonthName(selectedNoiTarget?.month)} {selectedNoiTarget?.year}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteNoiModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteNoi}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MonthlyTargets;
