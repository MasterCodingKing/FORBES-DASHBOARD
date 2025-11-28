import Card from '../common/Card';
import LineChart from '../charts/LineChart';
import Table from '../common/Table';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

const IncomeChart = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card title="Monthly Income Trend" className="animate-pulse">
        <div className="h-80 bg-gray-200 rounded" />
      </Card>
    );
  }

  const { months, yearTotal } = data;

  const chartData = {
    labels: months.map(m => m.monthName.substring(0, 3)),
    datasets: [{
      label: 'Income',
      data: months.map(m => m.income),
      borderColor: CHART_COLORS.success,
      backgroundColor: `${CHART_COLORS.success}20`
    }]
  };

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: 'Revenue', 
      render: (row) => formatCurrency(row.revenue)
    },
    { 
      header: 'Expenses', 
      render: (row) => formatCurrency(row.expenses)
    },
    { 
      header: 'Income', 
      render: (row) => (
        <span className={row.income >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {formatCurrency(row.income)}
        </span>
      )
    }
  ];

  return (
    <Card title="Monthly Income Trend (Revenue - Expenses)">
      <LineChart
        labels={chartData.labels}
        datasets={chartData.datasets}
        height={300}
        fill={true}
      />
      <div className="mt-6">
        <Table
          columns={columns}
          data={months}
          className="max-h-64 overflow-y-auto"
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
          <span className="font-semibold text-gray-700">Year Total Income</span>
          <span className={`text-xl font-bold ${yearTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(yearTotal)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default IncomeChart;
