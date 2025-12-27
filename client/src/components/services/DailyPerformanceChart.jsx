import LineChart from '../charts/LineChart';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const DailyPerformanceChart = ({ data, targetMonth, targetYear, targetAmount, dailyTarget, stats, targetSource }) => {
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
      datalabels: {
        display: true,
        color: '#ffffff',
        anchor: 'end',
        align: 'top',
        offset: 6,
        skip: function(context) {
          // Show only every 2nd-3rd point depending on total days to reduce clutter
          const dataLength = context.dataset.data.length;
          if (dataLength > 25) {
            return context.dataIndex % 3 !== 0; // Every 3rd point
          } else if (dataLength > 15) {
            return context.dataIndex % 2 !== 0; // Every 2nd point
          }
          return false; // Show all
        },
        formatter: (value) => {
          if (!value || value === 0) return '';
          const num = Math.round(value);
          if (num > 1000000) {
            return (num / 1000000).toFixed(0) + 'M';
          }
          return (num / 1000).toFixed(0) + 'K';
        },
        font: {
          size: 9,
          weight: 'bold',
          family: "'Segoe UI', 'Helvetica Neue', sans-serif"
        },
        backgroundColor: function(context) {
          const color = context.dataset.borderColor || '#3b82f6';
          return color.replace(')', ', 0.85)').replace('rgb', 'rgba');
        },
        borderRadius: 3,
        borderColor: function(context) {
          return context.dataset.borderColor || '#3b82f6';
        },
        borderWidth: 1,
        padding: {
          top: 2,
          right: 4,
          bottom: 2,
          left: 4
        }
      },
      legend: {
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value.toLocaleString('en-PH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          }
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
  // Round percentage to avoid floating point precision issues
  const percentOfTarget = stats?.percentOfTarget ?? (target > 0 ? Math.round(((totalSales / target) * 100) * 10) / 10 : 0);
  const difference = stats?.difference ?? (totalSales - target);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Daily Performance - {monthName} {targetYear}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Sales (Cumulative)
            </span>
            <span className="ml-4 inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Target (Cumulative)
            </span>
          </p>
        </div>
        {targetSource && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            targetSource === 'monthly' 
              ? 'bg-green-100 text-green-700' 
              : targetSource === 'department'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {targetSource === 'monthly' && '📊 Monthly Target'}
            {targetSource === 'department' && '🏢 Default Target'}
            {targetSource === 'none' && '⚠️ No Target Set'}
          </span>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-4">
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
