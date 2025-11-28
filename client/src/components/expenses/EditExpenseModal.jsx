import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { validateExpense } from '../../utils/validators';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import expenseService from '../../services/expenseService';

const EditExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: expense?.category || '',
    amount: expense?.amount?.toString() || '',
    expense_date: expense?.expense_date?.split('T')[0] || '',
    description: expense?.description || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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

    const validation = validateExpense(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      console.log('Validation errors:', validation.errors);
      return;
    }

    try {
      setLoading(true);
      await expenseService.update(expense.id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating expense:', err);
      setApiError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(c => ({
    value: c,
    label: c
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        <Select
          label="Category"
          name="category"
          options={categoryOptions}
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          required
          placeholder="Select a category"
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
        />

        <Input
          label="Expense Date"
          name="expense_date"
          type="date"
          value={formData.expense_date}
          onChange={handleChange}
          error={errors.expense_date}
          required
        />

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the expense"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Update Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditExpenseModal;
