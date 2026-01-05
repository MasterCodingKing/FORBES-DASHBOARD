import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import CreatableSelect from 'react-select/creatable';
import { validateExpense } from '../../utils/validators';
import expenseService from '../../services/expenseService';
import expenseCategoryService from '../../services/expenseCategoryService';
import { MONTHS } from '../../utils/constants';

// Generate expense code starting from 10000
const generateExpenseCode = (index, baseCode = 10000) => {
  return baseCode + index;
};

const createEmptyExpenseRow = (index, entryType = 'daily') => ({
  id: Date.now() + index, // Unique ID for React key
  code: generateExpenseCode(index),
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  description: '',
  entryType // 'daily' or 'monthly'
});

const AddExpenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [entryMode, setEntryMode] = useState('daily'); // 'daily' or 'monthly'
  const [expenses, setExpenses] = useState([createEmptyExpenseRow(0, 'daily')]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [nextCodeIndex, setNextCodeIndex] = useState(1);
  const [addingAccount, setAddingAccount] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await expenseCategoryService.getAll({ active_only: 'true' });
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setApiError('Failed to load expense accounts');
    } finally {
      setLoadingCategories(false);
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
        description: accountData.description.trim(),
        account_number: `4${Math.floor(Math.random() * 1000000)}`
      });
      
      // Refresh categories
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
      // Find the account by name to get its ID
      const account = categories.find(c => c.name === accountName);
      if (!account) {
        setApiError('Account not found');
        return;
      }

      await expenseCategoryService.delete(account.id);
      
      // Refresh categories
      await fetchCategories();
      
      // Clear selection if deleted account was selected
      setExpenses(prev => prev.map(exp => 
        exp.category === accountName ? { ...exp, category: '' } : exp
      ));
    } catch (err) {
      console.error('Error deleting account:', err);
      setApiError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setExpenses([createEmptyExpenseRow(0, entryMode)]);
      setNextCodeIndex(1);
      setErrors({});
      setApiError(null);
    }
  }, [isOpen]);

  // Update expenses when entry mode changes
  const handleEntryModeChange = (mode) => {
    setEntryMode(mode);
    setExpenses([createEmptyExpenseRow(0, mode)]);
    setNextCodeIndex(1);
    setErrors({});
  };

  const handleChange = (expenseId, field, value) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expenseId ? { ...exp, [field]: value } : exp
    ));
    // Clear error for this field
    if (errors[`${expenseId}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${expenseId}-${field}`];
        return newErrors;
      });
    }
  };

  const addExpenseRow = () => {
    setExpenses(prev => [...prev, createEmptyExpenseRow(nextCodeIndex, entryMode)]);
    setNextCodeIndex(prev => prev + 1);
  };

  const removeExpenseRow = (expenseId) => {
    if (expenses.length === 1) {
      // Don't remove the last row, just reset it
      setExpenses([createEmptyExpenseRow(0, entryMode)]);
      setNextCodeIndex(1);
      return;
    }
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    // Clear errors for removed row
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${expenseId}-`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const validateAllExpenses = () => {
    const newErrors = {};
    let isValid = true;

    expenses.forEach(expense => {
      const validation = validateExpense({
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        description: expense.description
      });

      if (!validation.isValid) {
        isValid = false;
        Object.entries(validation.errors).forEach(([field, error]) => {
          newErrors[`${expense.id}-${field}`] = error;
        });
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateAllExpenses()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare expenses data for bulk creation
      const expensesData = expenses.map(exp => {
        // For monthly entry, calculate the date as the last day of the selected month
        let expenseDate = exp.date;
        if (entryMode === 'monthly') {
          const lastDay = new Date(exp.year, exp.month, 0).getDate();
          expenseDate = `${exp.year}-${String(exp.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        }
        
        return {
          category: exp.category,
          amount: parseFloat(exp.amount),
          date: expenseDate,
          description: exp.description || `Expense Code: ${exp.code}`
        };
      });

      // Create all expenses
      if (expensesData.length === 1) {
        await expenseService.create(expensesData[0]);
      } else {
        await expenseService.createBulk(expensesData);
      }
      
      // Reset form
      setExpenses([createEmptyExpenseRow(0, entryMode)]);
      setNextCodeIndex(1);
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating expenses:', err);
      setApiError(err.response?.data?.message || 'Failed to create expenses');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(c => ({
    value: c.name,
    label: c.name
  }));

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i).map(y => ({
    value: y,
    label: y.toString()
  }));

  // Month options
  const monthOptions = MONTHS.map(m => ({
    value: m.value,
    label: m.label
  }));

  // Custom Option component with delete icon
  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    
    const handleDelete = (e) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete "${data.label}"?`)) {
        handleDeleteAccount(data.value);
      }
    };

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
        style={{
          backgroundColor: props.isSelected ? '#2563eb' : props.isFocused ? '#eff6ff' : 'white',
          color: props.isSelected ? 'white' : '#1f2937',
        }}
      >
        <span>{data.label}</span>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
          title="Delete category"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '36px',
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    }),
    option: (base) => ({
      ...base,
      padding: 0
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '200px',
      padding: 0
    })
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expenses" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Entry Mode Toggle */}
        <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleEntryModeChange('daily')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              entryMode === 'daily'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Daily Entry
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleEntryModeChange('monthly')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              entryMode === 'monthly'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Monthly Entry
            </span>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-blue-600 font-medium">Total Expenses: </span>
            <span className="text-lg font-bold text-blue-700">{expenses.length}</span>
          </div>
          <div>
            <span className="text-sm text-blue-600 font-medium">Total Amount: </span>
            <span className="text-lg font-bold text-blue-700">
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Expense Rows */}
        <div className="space-y-4" >
          {expenses.map((expense, index) => (
            <div 
              key={expense.id} 
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative"
            >
              {/* Row Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    #{expense.code}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    Expense {index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExpenseRow(expense.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  title="Remove expense"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Form Fields */}
              <div className={`grid grid-cols-1 ${entryMode === 'daily' ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-3`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account <span className="text-red-500">*</span>
                  </label>
                  <CreatableSelect
                    options={categoryOptions}
                    value={categoryOptions.find(opt => opt.value === expense.category) || null}
                    onChange={(option) => handleChange(expense.id, 'category', option?.value || '')}
                    onCreateOption={async (inputValue) => {
                      try {
                        await handleAddAccount({ name: inputValue, description: '' });
                        handleChange(expense.id, 'category', inputValue);
                      } catch (err) {
                        // Error is handled in handleAddAccount
                      }
                    }}
                    placeholder="Search, select, or create..."
                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    components={{ Option: CustomOption }}
                    isClearable
                    isSearchable
                    styles={customSelectStyles}
                    isLoading={loadingCategories || addingAccount}
                    isDisabled={addingAccount}
                  />
                  {errors[`${expense.id}-category`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`${expense.id}-category`]}</p>
                  )}
                </div>

                <Input
                  label="Amount"
                  name={`amount-${expense.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999999999.99"
                  value={expense.amount}
                  onChange={(e) => handleChange(expense.id, 'amount', e.target.value)}
                  error={errors[`${expense.id}-amount`]}
                  required
                  placeholder="0.00"
                />

                {entryMode === 'daily' ? (
                  <Input
                    label="Date"
                    name={`date-${expense.id}`}
                    type="date"
                    value={expense.date}
                    onChange={(e) => handleChange(expense.id, 'date', e.target.value)}
                    error={errors[`${expense.id}-date`]}
                    required
                  />
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={expense.month}
                        onChange={(e) => handleChange(expense.id, 'month', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {monthOptions.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={expense.year}
                        onChange={(e) => handleChange(expense.id, 'year', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {yearOptions.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <Input
                  label="Description"
                  name={`description-${expense.id}`}
                  value={expense.description}
                  onChange={(e) => handleChange(expense.id, 'description', e.target.value)}
                  error={errors[`${expense.id}-description`]}
                  required
                  placeholder={entryMode === 'daily' ? "e.g., 13th Month Expense" : "e.g., Monthly Utilities"}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <button
          type="button"
          onClick={addExpenseRow}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Expense
        </button>

        <div className="flex justify-end gap-3 pt-4 border-t">
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
            {expenses.length === 1 ? 'Add Expense' : `Add ${expenses.length} Expenses`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
