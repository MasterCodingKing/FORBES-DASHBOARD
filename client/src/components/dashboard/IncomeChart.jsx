import { useMemo } from 'react';
import Card from '../common/Card';
import LineChart from '../charts/LineChart';
import DataTable from '../common/DataTable';
import ExportButton from '../common/ExportButton';
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

  // Calculate yearly breakdown
  const yearSalesRevenue = months.reduce((sum, m) => sum + (m.salesRevenue || m.revenue || 0), 0);
  const yearNOI = months.reduce((sum, m) => sum + (m.noi || 0), 0);
  const yearExpenses = months.reduce((sum, m) => sum + (m.expenses || 0), 0);

  const exportData = useMemo(() => 
    months.map(m => ({
      Month: m.monthName,
      'Sales Revenue': m.revenue || m.salesRevenue,
      'NOI': m.noi,
      'Expenses': m.expenses,
      'Income': m.income
    })),
    [months]
  );

  const chartData = {
    labels: months.map(m => m.monthName.substring(0, 3)),
    datasets: [{
      label: 'Income net',
      data: months.map(m => m.income),
      borderColor: CHART_COLORS.success,
      backgroundColor: `${CHART_COLORS.success}20`
    }]
  };

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: 'Revenue',
      accessor: 'revenue',
      render: (row) => formatCurrency(row.revenue)
    },
    { 
      header: 'NOI',
      accessor: 'noi',
      render: (row) => formatCurrency(row.noi)
    },
    { 
      header: 'Expenses',
      accessor: 'expenses',
      render: (row) => formatCurrency(row.expenses)
    },
    { 
      header: 'Income (Revenue - Expenses + NOI)',
      accessor: 'income',
      render: (row) => (
        <span className={row.income >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {formatCurrency(row.income)}
        </span>
      )
    }
  ];

  return (
    <div id="income-chart-export">
      <Card 
        title="Monthly Income Trend (Revenue - Expenses + NOI)"
        headerAction={
          <ExportButton
            elementId="income-chart-export"
            filename="monthly-income"
            title="Monthly Income Trend"
            data={exportData}
            type="chart"
          />
        }
      >
      <LineChart
        labels={chartData.labels}
        datasets={chartData.datasets}
        height={300}
        fill={true}
        showValues={true}
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={months}
          searchable={false}
          rowsPerPageOptions={[12]}
          defaultRowsPerPage={12}
          defaultSortKey="month"
          defaultSortOrder="asc"
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-5 gap-3">
            <div>
              <p className="text-xs text-gray-600 uppercase">Year Sales Revenue</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(yearSalesRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Year NOI</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(yearNOI)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Year Expenses</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(yearExpenses)}</p>
            </div>
            <div className="col-span-2 border-l pl-3">
              <p className="text-xs text-gray-600 uppercase font-semibold">Year Total Income</p>
              <p className={`text-sm font-bold ${yearTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(yearTotal)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">(Sales Revenue + NOI - Expenses)</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default IncomeChart;
