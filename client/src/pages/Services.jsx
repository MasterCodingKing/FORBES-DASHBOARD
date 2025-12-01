import { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import DataTable from '../components/common/DataTable';
import departmentService from '../services/departmentService';
import { formatCurrency } from '../utils/formatters';

const Services = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', description: '', target: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.data?.departments || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', target: '' });
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      target: dept.target?.toString() || ''
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleOpenDelete = (dept) => {
    setSelectedDepartment(dept);
    setDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Service name is required';
    }
    if (formData.target && isNaN(parseFloat(formData.target))) {
      errors.target = 'Target must be a valid number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || ''
      };
      
      // Only include target if it has a value
      if (formData.target && formData.target.trim() !== '') {
        payload.target = parseFloat(formData.target);
      }
      
      await departmentService.create(payload);
      setSuccess('Service created successfully');
      setAddModalOpen(false);
      resetForm();
      loadDepartments();
    } catch (err) {
      console.error('Error creating department:', err);
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || ''
      };
      
      // Only include target if it has a value
      if (formData.target && formData.target.trim() !== '') {
        payload.target = parseFloat(formData.target);
      }
      
      await departmentService.update(selectedDepartment.id, payload);
      setSuccess('Service updated successfully');
      setEditModalOpen(false);
      setSelectedDepartment(null);
      resetForm();
      loadDepartments();
    } catch (err) {
      console.error('Error updating department:', err);
      setError(err.response?.data?.message || 'Failed to update service');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(selectedDepartment.id);
      setSuccess('Service deleted successfully');
      setDeleteModalOpen(false);
      setSelectedDepartment(null);
      loadDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500">Manage department services</p>
        </div>
        <Button onClick={handleOpenAdd}>
          + Add Service
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Services Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={[
            { 
              header: 'ID', 
              accessor: 'id' 
            },
            { 
              header: 'Name', 
              accessor: 'name' 
            },
            { 
              header: 'Description', 
              accessor: 'description',
              render: (row) => row.description || '-'
            },
            { 
              header: 'Monthly Target', 
              accessor: 'target',
              render: (row) => row.target ? formatCurrency(row.target) : 'Not set'
            },
            { 
              header: 'Actions', 
              accessor: 'actions',
              sortable: false,
              render: (row) => (
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenDelete(row)}
                  >
                    Delete
                  </Button>
                </div>
              )
            }
          ]}
          data={departments}
          defaultSortKey="id"
          defaultSortOrder="asc"
          emptyMessage="No services found. Add a service to get started."
        />
      )}


      {/* Add Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Service">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            required
            placeholder="Enter service name"
          />
           <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={formErrors.description}
            placeholder="Enter service description"
          />
          <Input
            label="Monthly Target (Optional)"
            name="target"
            type="number"
            step="0.01"
            min="0"
            value={formData.target}
            onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
            error={formErrors.target}
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
              Add Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Service">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}  
            error={formErrors.name}
            required
            placeholder="Enter service name"
          />
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={formErrors.description}
            placeholder="Enter service description"
          />
          <Input
            label="Monthly Target (Optional)"
            name="target"
            type="number"
            step="0.01"
            min="0"
            value={formData.target}
            onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
            error={formErrors.target}
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
              Update Service
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
            Are you sure you want to delete the service{' '}
            <span className="font-semibold">{selectedDepartment?.name}</span>?
          </p>
          <p className="text-sm text-red-600">
            Warning: This will affect all sales records associated with this service.
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
    </div>
  );
};

export default Services;
