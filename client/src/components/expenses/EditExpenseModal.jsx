import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import AccountSelect from '../common/AccountSelect';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { validateExpense } from '../../utils/validators';
import expenseService from '../../services/expenseService';
import expenseCategoryService from '../../services/expenseCategoryService';

const EditExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: expense?.category || '',
    amount: expense?.amount?.toString() || '',
    date: expense?.date?.split('T')[0] || '',
    description: expense?.description || ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [addingAccount, setAddingAccount] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await expenseCategoryService.getAll({ active_only: 'true' });
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddAccount = async (accountData) => {
    if (!accountData.name.trim()) {
      setApiError('Account name is required');
      return;
    }

    try {
      setAddingAccount(true);
      const response = await expenseCategoryService.create({
        name: accountData.name.trim(),
        description: accountData.description.trim()
      });
      
      await fetchCategories();
      return response;
    } catch (err) {
      console.error('Error creating account:', err);
      setApiError(err.response?.data?.message || 'Failed to create account');
      throw err;
    } finally {
      setAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (accountName) => {
    try {
      const account = categories.find(c => c.name === accountName);
      if (!account) {
        setApiError('Account not found');
        return;
      }

      await expenseCategoryService.delete(account.id);
      await fetchCategories();
      
      if (formData.category === accountName) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setApiError(err.response?.data?.message || 'Failed to delete account');
    }
  };

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

  const categoryOptions = categories.map(c => ({
    value: c.name,
    label: `${c.name}`
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        <AccountSelect
          label="Account"
          value={formData.category}
          onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
          options={categoryOptions}
          onAddAccount={handleAddAccount}
          onDeleteAccount={handleDeleteAccount}
          error={errors.category}
          required
          loadingAdd={addingAccount}
        />

        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          max="999999999999.99"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          required
          placeholder="0.00"
        />

        <Input
          label="Expense Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
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
