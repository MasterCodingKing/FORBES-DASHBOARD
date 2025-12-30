import { useMemo } from 'react';
import Card from '../common/Card';
import LineChart from '../charts/LineChart';
import DataTable from '../common/DataTable';
import ExportButton from '../common/ExportButton';
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

  // Calculate yearly totals
  const yearSalesRevenue = months.reduce((sum, m) => sum + (m.salesRevenue || 0), 0);
  const yearNOI = months.reduce((sum, m) => sum + (m.noi || 0), 0);

  const exportData = useMemo(() => 
    months.map(m => ({
      Month: m.monthName,
      'Sales Revenue': m.salesRevenue,
      'NOI': m.noi,
      'Total Revenue': m.total
    })),
    [months]
  );

  const chartData = {
    labels: months.map(m => m.monthName.substring(0, 3)),
    datasets: [{
      label: 'Total Revenue',
      data: months.map(m => m.total),
      borderColor: CHART_COLORS.primary,
      backgroundColor: `${CHART_COLORS.primary}20`
    }]
  };

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: 'Sales Revenue',
      accessor: 'salesRevenue',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.salesRevenue)}</span>
      )
    },
    { 
      header: 'NOI',
      accessor: 'noi',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.noi)}</span>
      )
    },
    { 
      header: 'Total Revenue',
      accessor: 'total',
      render: (row) => (
        <span className="font-medium font-bold">{formatCurrency(row.total)}</span>
      )
    }
  ];

  return (
    <div id="revenue-chart-export">
      <Card 
        title="Monthly Revenue Trend"
        headerAction={
          <ExportButton
            elementId="revenue-chart-export"
            filename="monthly-revenue"
            title="Monthly Revenue Trend"
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
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase">Year Sales Revenue</p>
              <p className="text-lg font-bold text-primary-600">{formatCurrency(yearSalesRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Year NOI</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(yearNOI)}</p>
            </div>
            <div className="col-span-2 border-l pl-4">
              <p className="text-xs text-gray-600 uppercase font-semibold">Year Total Revenue</p>
              <p className="text-lg font-bold text-primary-700">{formatCurrency(yearTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">(Sales Revenue + NOI)</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default RevenueChart;
