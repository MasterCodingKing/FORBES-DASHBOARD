import LineChart from '../charts/LineChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const DailyPerformanceChart = ({ data, targetMonth, targetYear, targetAmount, dailyTarget, stats }) => {
  // Return early if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Performance</h3>
        <p className="text-gray-500 text-center py-8">No data available for this period</p>
      </div>
    );
  }

  const monthName = new Date(2000, targetMonth - 1, 1).toLocaleString('en-US', { month: 'long' });

  // Calculate running total
  let runningTotal = 0;
  const runningTotals = data.map(day => {
    runningTotal += day.total;
    return runningTotal;
  });

  // Calculate target line (use dailyTarget from backend if available)
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const calculatedDailyTarget = dailyTarget || (targetAmount / daysInMonth);
  const targetLine = data.map((_, index) => calculatedDailyTarget * (index + 1));

  const chartData = {
    labels: data.map(d => d.day.toString()),
    datasets: [
      {
        label: 'Sales',
        data: runningTotals,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Target',
        data: targetLine,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatNumber(value)
        }
      },
      x: {
        title: {
          display: true,
          text: 'Day of Month'
        }
      }
    }
  };

  // Use stats from backend if available, otherwise calculate
  const totalSales = stats?.sales ?? (runningTotals[runningTotals.length - 1] || 0);
  const target = stats?.target ?? targetAmount;
  const percentOfTarget = stats?.percentOfTarget ?? (target > 0 ? ((totalSales / target) * 100) : 0);
  const difference = stats?.difference ?? (totalSales - target);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Daily Performance - {monthName} {targetYear}
      </h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-medium">Total Sales</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 font-medium">Target</p>
          <p className="text-lg font-bold text-gray-700">{formatCurrency(target)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600 font-medium">% of Target</p>
          <p className="text-lg font-bold text-purple-700">{percentOfTarget.toFixed(1)}%</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${difference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-xs font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Difference
          </p>
          <p className={`text-lg font-bold ${difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(Math.abs(difference))}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <LineChart data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DailyPerformanceChart;
