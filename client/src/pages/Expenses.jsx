import { useState, useEffect, useCallback } from 'react';
import { AddExpenseModal, EditExpenseModal, ExpensesTable } from '../components/expenses';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import expenseService from '../services/expenseService';
import { formatCurrency } from '../utils/formatters';
import { MONTHS, getYears, EXPENSE_CATEGORIES } from '../utils/constants';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 

  // Filters
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
  const [filterCategory, setFilterCategory] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        month: filterMonth,
        year: filterYear
      };

      if (filterCategory) {
        params.category = filterCategory;
      }

      const response = await expenseService.getAll(params);
      setExpenses(response.data?.expenses || []);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterCategory]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await expenseService.delete(selectedExpense.id);
      setSuccess('Expense deleted successfully');
      setDeleteModalOpen(false);
      setSelectedExpense(null);
      loadExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  const handleSuccess = () => {
    setSuccess('Expense saved successfully');
    loadExpenses();
  };

  const years = getYears();
  const monthOptions = MONTHS.map(m => ({ value: m.value, label: m.label }));
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }));
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))
  ];

  // Calculate total
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // Group by category for summary
  const categoryBreakdown = expenses.reduce((acc, e) => {
    if (!acc[e.category]) {
      acc[e.category] = 0;
    }
    acc[e.category] += parseFloat(e.amount || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-500">Manage expense records</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          + Add Expense
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Month"
            options={monthOptions}
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          />
          <Select
            label="Year"
            options={yearOptions}
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
          <div className="flex items-end">
            <div className="bg-red-50 rounded-lg p-4 w-full">
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium truncate">{category}</p>
                <p className="text-sm font-bold text-gray-800">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <ExpensesTable
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add Modal */}
      <AddExpenseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Edit Modal */}
      {selectedExpense && (
        <EditExpenseModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this expense of{' '}
            <span className="font-semibold">{formatCurrency(selectedExpense?.amount || 0)}</span>?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
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
      </Modal> 
    </div>
  );
};
export default Expenses;
