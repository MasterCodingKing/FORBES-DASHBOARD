import { useMemo } from 'react';
import Card from '../common/Card';
import BarChart from '../charts/BarChart';
import Table from '../common/Table';
import ExportButton from '../common/ExportButton';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

const MonthToMonthComparison = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card title="Month-to-Month Comparison" className="animate-pulse">
        <div className="h-80 bg-gray-200 rounded" />
      </Card>
    );
  }

  const { comparison, totals } = data;

  const exportData = useMemo(() => 
    comparison.map(c => ({
      Service: c.departmentName,
      'Previous Month': c.previousMonth,
      'Current Month': c.currentMonth,
      Difference: c.difference,
      'Change %': c.percentChange
    })),
    [comparison]
  );

  const chartData = {
    labels: comparison.map(c => c.departmentName),
    datasets: [
      {
        label: 'Previous Month',
        data: comparison.map(c => c.previousMonth),
        backgroundColor: CHART_COLORS.secondary
      },
      {
        label: 'Current Month',
        data: comparison.map(c => c.currentMonth),
        backgroundColor: CHART_COLORS.primary
      }
    ]
  };

  const columns = [
    { header: 'Service', accessor: 'departmentName' },
    { 
      header: 'Previous', 
      render: (row) => formatCurrency(row.previousMonth)
    },
    { 
      header: 'Current', 
      render: (row) => formatCurrency(row.currentMonth)
    },
    { 
      header: 'Difference', 
      render: (row) => (
        <span className={row.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.difference)}
        </span>
      )
    },
    { 
      header: 'Change %', 
      render: (row) => (
        <span className={row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercent(row.percentChange)}
        </span>
      )
    }
  ];

  return (
    <div id="month-to-month-export">
      <Card 
        title="Month-to-Month Comparison"
        headerAction={
          <ExportButton
            elementId="month-to-month-export"
            filename="month-to-month-comparison"
            title="Month-to-Month Comparison"
            data={exportData}
            type="chart"
          />
        }
      >
      <BarChart
        labels={chartData.labels}
        datasets={chartData.datasets}
        height={300}
      />
      <div className="mt-6">
        <Table columns={columns} data={comparison} />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Previous Month</p>
              <p className="text-lg font-semibold">{formatCurrency(totals.previousMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Month</p>
              <p className="text-lg font-semibold">{formatCurrency(totals.currentMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Difference</p>
              <p className={`text-lg font-semibold ${totals.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.difference)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Change %</p>
              <p className={`text-lg font-semibold ${totals.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(totals.percentChange)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default MonthToMonthComparison;
