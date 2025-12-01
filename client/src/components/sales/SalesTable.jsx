import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import DataTable from '../common/DataTable';

const SalesTable = ({ sales, onEdit, onDelete, loading }) => {
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

  // Ensure sales is always an array
  const salesData = Array.isArray(sales) ? sales : [];

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
          header: 'Service',
          accessor: 'department_id',
          render: (row) => (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {row.department?.name || row.Department?.name || 'Unknown'}
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
      data={salesData}
      defaultSortKey="date"
      defaultSortOrder="desc"
      emptyMessage="No sales records found for this period"
    />
  );
};

export default SalesTable;
