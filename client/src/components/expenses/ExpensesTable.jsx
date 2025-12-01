import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import DataTable from '../common/DataTable';

const ExpensesTable = ({ expenses, onEdit, onDelete, loading }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Salaries': 'bg-purple-100 text-purple-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Supplies': 'bg-green-100 text-green-800',
      'Equipment': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Rent': 'bg-indigo-100 text-indigo-800',
      'Travel': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={[
        {
          header: 'ID',
          accessor: 'id'
        },
        {
          header: 'Date',
          accessor: 'date',
          render: (row) => formatDate(row.date)
        },
        {
          header: 'Category',
          accessor: 'category',
          render: (row) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(row.category)}`}>
              {row.category}
            </span>
          )
        },
        {
          header: 'Amount',
          accessor: 'amount',
          render: (row) => (
            <span className="font-medium text-gray-900">{formatCurrency(row.amount)}</span>
          )
        },
        {
          header: 'Description',
          accessor: 'description',
          render: (row) => (
            <span className="max-w-xs truncate block">{row.description || '-'}</span>
          )
        },
        {
          header: 'Actions',
          accessor: 'actions',
          sortable: false,
          render: (row) => (
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(row)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(row)}
              >
                Delete
              </Button>
            </div>
          )
        }
      ]}
      data={expenses}
      defaultSortKey="date"
      defaultSortOrder="desc"
      emptyMessage="No expense records found for this period"
    />
  );
};

export default ExpensesTable;
