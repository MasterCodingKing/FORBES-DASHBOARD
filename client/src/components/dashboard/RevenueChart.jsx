import Card from '../common/Card';
import LineChart from '../charts/LineChart';
import Table from '../common/Table';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

const RevenueChart = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card title="Monthly Revenue Trend" className="animate-pulse">
        <div className="h-80 bg-gray-200 rounded" />
      </Card>
    );
  }

  const { months, yearTotal } = data;

  const chartData = {
    labels: months.map(m => m.monthName.substring(0, 3)),
    datasets: [{
      label: 'Revenue',
      data: months.map(m => m.total),
      borderColor: CHART_COLORS.primary,
      backgroundColor: `${CHART_COLORS.primary}20`
    }]
  };

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: 'Revenue', 
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      )
    }
  ];

  return (
    <Card title="Monthly Revenue Trend">
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
          <span className="font-semibold text-gray-700">Year Total</span>
          <span className="text-xl font-bold text-primary-600">{formatCurrency(yearTotal)}</span>
        </div>
      </div>
    </Card>
  );
};

export default RevenueChart;
