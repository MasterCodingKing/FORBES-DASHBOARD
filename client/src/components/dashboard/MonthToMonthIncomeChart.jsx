import { useMemo } from 'react';
import Card from '../common/Card';
import LineChart from '../charts/LineChart';
import DataTable from '../common/DataTable';
import ExportButton from '../common/ExportButton';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

const MonthToMonthIncomeChart = ({ currentYearData, previousYearData, loading, year }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = useMemo(() => {
    if (!currentYearData && !previousYearData) return null;

    const currentMonths = currentYearData?.months || [];
    const previousMonths = previousYearData?.months || [];

    return {
      labels: monthNames,
      datasets: [
        {
          label: `${year - 1} Income`,
          data: previousMonths.map(m => m?.income || 0),
          borderColor: CHART_COLORS.secondary,
          backgroundColor: CHART_COLORS.secondary + '20',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: `${year} Income`,
          data: currentMonths.map(m => m?.income || 0),
          borderColor: CHART_COLORS.primary,
          backgroundColor: CHART_COLORS.primary + '20',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [currentYearData, previousYearData, year]);

  const tableData = useMemo(() => {
    if (!currentYearData && !previousYearData) return [];

    const currentMonths = currentYearData?.months || [];
    const previousMonths = previousYearData?.months || [];

    return monthNames.map((month, idx) => {
      const currentIncome = currentMonths[idx]?.income || 0;
      const previousIncome = previousMonths[idx]?.income || 0;
      const difference = currentIncome - previousIncome;
      const percentChange = previousIncome > 0 
        ? ((difference / previousIncome) * 100) 
        : (currentIncome > 0 ? 100 : 0);

      return {
        month,
        previousIncome,
        currentIncome,
        difference,
        percentChange
      };
    });
  }, [currentYearData, previousYearData]);

  const exportData = useMemo(() => 
    tableData.map(row => ({
      Month: row.month,
      [`${year - 1} Income`]: row.previousIncome,
      [`${year} Income`]: row.currentIncome,
      Difference: row.difference,
      'Change %': row.percentChange
    })),
    [tableData, year]
  );

  const totals = useMemo(() => {
    const currentTotal = currentYearData?.yearTotal || 0;
    const previousTotal = previousYearData?.yearTotal || 0;
    const difference = currentTotal - previousTotal;
    const percentChange = previousTotal > 0 
      ? ((difference / previousTotal) * 100) 
      : (currentTotal > 0 ? 100 : 0);

    return {
      current: currentTotal,
      previous: previousTotal,
      difference,
      percentChange
    };
  }, [currentYearData, previousYearData]);

  if (loading) {
    return (
      <Card title="Month to Month Income Comparison" className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded" />
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card title="Month to Month Income Comparison">
        <div className="text-center py-12 text-gray-500">
          No income data available for comparison
        </div>
      </Card>
    );
  }

  const columns = [
    { header: 'Month', accessor: 'month', className: 'font-medium' },
    { 
      header: `${year - 1}`, 
      render: (row) => formatCurrency(row.previousIncome),
      className: 'text-right'
    },
    { 
      header: `${year}`, 
      render: (row) => formatCurrency(row.currentIncome),
      className: 'text-right'
    },
    { 
      header: 'Variance', 
      render: (row) => (
        <span className={row.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.difference)}
        </span>
      ),
      className: 'text-right'
    },
    { 
      header: 'Change %', 
      render: (row) => (
        <span className={row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercent(row.percentChange)}
        </span>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div id="month-to-month-income-export">
      <Card 
        title={`Month to Month Income Comparison (${year - 1} vs ${year})`}
        headerAction={
          <ExportButton
            elementId="month-to-month-income-export"
            filename={`month-to-month-income-${year}`}
            title={`Month to Month Income Comparison`}
            data={exportData}
            type="chart"
          />
        }
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">{year - 1} Total</p>
            <p className="text-lg font-semibold">{formatCurrency(totals.previous)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">{year} Total</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.current)}</p>
          </div>
          <div className={`p-4 rounded-lg ${totals.difference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-600">Difference</p>
            <p className={`text-lg font-semibold ${totals.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.difference)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${totals.percentChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-600">Growth</p>
            <p className={`text-lg font-semibold ${totals.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(totals.percentChange)}
            </p>
          </div>
        </div>

        {/* Line Chart */}
        <LineChart
          labels={chartData.labels}
          datasets={chartData.datasets}
          height={350}
          showValues={true}
        />

        {/* Data Table */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
          <DataTable 
            columns={columns} 
            data={tableData}
            searchable={false}
            rowsPerPageOptions={[12]}
            defaultRowsPerPage={12}
            defaultSortKey="month"
            defaultSortOrder="asc"
          />
        </div>
      </Card>
    </div>
  );
};

export default MonthToMonthIncomeChart;
