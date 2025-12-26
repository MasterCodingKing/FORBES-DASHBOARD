import { useMemo } from 'react';
import Card from '../common/Card';
import BarChart from '../charts/BarChart';
import ExportButton from '../common/ExportButton';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

const DailySalesChart = ({ data, loading, month, year }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group sales by day
    const salesByDay = {};
    data.forEach(sale => {
      const saleDate = new Date(sale.date);
      const day = saleDate.getDate();
      
      // Only include sales from the selected month/year
      if (saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year) {
        if (!salesByDay[day]) {
          salesByDay[day] = 0;
        }
        salesByDay[day] += parseFloat(sale.amount) || 0;
      }
    });

    // Get number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create arrays for all days of the month
    const labels = [];
    const values = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      labels.push(day.toString());
      values.push(salesByDay[day] || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Sales',
          data: values,
          backgroundColor: CHART_COLORS.primary,
          borderColor: CHART_COLORS.primary,
          borderWidth: 1
        }
      ],
      totals: values
    };
  }, [data, month, year]);

  const totalSales = useMemo(() => {
    if (!chartData) return 0;
    return chartData.totals.reduce((sum, val) => sum + val, 0);
  }, [chartData]);

  const exportData = useMemo(() => {
    if (!chartData) return [];
    return chartData.labels.map((day, idx) => ({
      Day: day,
      Sales: chartData.totals[idx]
    }));
  }, [chartData]);

  if (loading) {
    return (
      <Card title="Daily Sales" className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded" />
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card title="Daily Sales">
        <div className="text-center py-12 text-gray-500">
          No sales data available for this period
        </div>
      </Card>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div id="daily-sales-chart-export">
      <Card 
        title={`Daily Sales - ${monthNames[month - 1]} ${year}`}
        headerAction={
          <ExportButton
            elementId="daily-sales-chart-export"
            filename={`daily-sales-${monthNames[month - 1]}-${year}`}
            title={`Daily Sales - ${monthNames[month - 1]} ${year}`}
            data={exportData}
            type="chart"
          />
        }
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Sales for {monthNames[month - 1]} {year}</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
        </div>

        <BarChart
          labels={chartData.labels}
          datasets={chartData.datasets}
          height={400}
          showLegend={false}
          showValues={true}
        />

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Average Daily</p>
            <p className="text-lg font-semibold">
              {formatCurrency(totalSales / chartData.labels.length)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Highest Day</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.max(...chartData.totals))}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Lowest Day</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.min(...chartData.totals.filter(v => v > 0)))}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Days with Sales</p>
            <p className="text-lg font-semibold">
              {chartData.totals.filter(v => v > 0).length} / {chartData.labels.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DailySalesChart;
