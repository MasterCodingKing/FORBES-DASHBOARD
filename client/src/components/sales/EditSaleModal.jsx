import { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { validateSale } from '../../utils/validators';
import salesService from '../../services/salesService';

const EditSaleModal = ({ isOpen, onClose, sale, departments, onSuccess }) => {
  const [formData, setFormData] = useState({
    department_id: sale?.department_id?.toString() || '',
    amount: sale?.amount?.toString() || '',
    sale_date: sale?.date?.split('T')[0] || '',
    remarks: sale?.remarks || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Check if sale is older than 5 days
  const isEditableByDate = useMemo(() => {
    if (!sale?.date) return true;
    
    const saleDate = new Date(sale.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    saleDate.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
    return daysDifference <= 5;
  }, [sale?.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validation = validateSale(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      await salesService.update(sale.id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating sale:', err);
      setApiError(err.response?.data?.message || 'Failed to update sale');
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = departments.map(d => ({
    value: d.id,
    label: d.name
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Sale">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {!isEditableByDate && (
          <Alert 
            type="warning" 
            message="This sale is older than 5 days and cannot be edited. Only sales from the previous 5 days can be modified."
          />
        )}

        <Select
          label="Service"
          name="department_id"
          options={departmentOptions}
          value={formData.department_id}
          onChange={handleChange}
          error={errors.department_id}
          required
          placeholder="Select a service"
          disabled={!isEditableByDate}
        />

        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          required
          placeholder="0.00"
          disabled={!isEditableByDate}
        />

        <Input
          label="Sale Date"
          name="sale_date"
          type="date"
          value={formData.sale_date}
          onChange={handleChange}
          error={errors.sale_date}
          required
          disabled={!isEditableByDate}
        />

        <Input
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Optional notes"
          disabled={!isEditableByDate}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {isEditableByDate ? 'Cancel' : 'Close'}
          </Button>
          {isEditableByDate && (
            <Button
              type="submit"
              loading={loading}
            >
              Update Sale
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EditSaleModal;
