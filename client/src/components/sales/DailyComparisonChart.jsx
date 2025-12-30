import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';
import ExportButton from '../common/ExportButton';
import { formatCurrency, abbreviateNumber } from '../../utils/formatters';
import Table from '../common/Table';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const DailyComparisonChart = ({ sales, currentMonth, currentYear }) => {
  const chartData = useMemo(() => {
    // Get previous month
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get days in current and previous month
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const maxDays = Math.max(daysInCurrentMonth, daysInPrevMonth);

    // Initialize daily totals
    const currentMonthData = Array(daysInCurrentMonth).fill(0);
    const prevMonthData = Array(daysInPrevMonth).fill(0);

    // Aggregate sales by day
    sales.forEach(sale => {
      // Parse date string directly to avoid timezone issues
      // Format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ"
      const dateStr = sale.date;
      let saleYear, saleMonth, saleDay;
      
      if (typeof dateStr === 'string') {
        // Extract date parts directly from the string
        const datePart = dateStr.split('T')[0]; // Get "YYYY-MM-DD" part
        const parts = datePart.split('-');
        saleYear = parseInt(parts[0], 10);
        saleMonth = parseInt(parts[1], 10);
        saleDay = parseInt(parts[2], 10);
      } else {
        const saleDate = new Date(dateStr);
        saleMonth = saleDate.getMonth() + 1;
        saleYear = saleDate.getFullYear();
        saleDay = saleDate.getDate();
      }

      if (saleYear === currentYear && saleMonth === currentMonth) {
        currentMonthData[saleDay - 1] += parseFloat(sale.amount || 0);
      } else if (saleYear === prevYear && saleMonth === prevMonth) {
        prevMonthData[saleDay - 1] += parseFloat(sale.amount || 0);
      }
    });

    // Create labels (1, 2, 3, ... maxDays)
    const labels = Array.from({ length: maxDays }, (_, i) => (i + 1).toString());

    // Pad shorter month with null values
    const paddedPrevMonth = [...prevMonthData];
    while (paddedPrevMonth.length < maxDays) {
      paddedPrevMonth.push(null);
    }

    const currentMonthName = new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long' });
    const prevMonthName = new Date(prevYear, prevMonth - 1).toLocaleString('en-US', { month: 'long' });

    return {
      labels,
      maxDays,
      currentMonthName,
      prevMonthName,
      prevYear,
      datasets: [
        {
          label: `${currentMonthName} ${currentYear}`,
          data: currentMonthData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: `${prevMonthName} ${prevYear}`,
          data: paddedPrevMonth,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          spanGaps: true
        }
      ]
    };
  }, [sales, currentMonth, currentYear]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: function(context) {
          return context.dataset.borderColor || '#3b82f6';
        },
        anchor: 'end',
        align: 'top',
        offset: 8,
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
          return abbreviateNumber(value, 1);
        },
        font: {
          size: 9,
          weight: 'bold',
          family: "'Segoe UI', 'Helvetica Neue', sans-serif"
        }
      },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        },
        onClick: null // Disable legend click to prevent dataset toggling
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
      },
      annotation: {
        annotations: {}
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

  // Calculate statistics
  const currentTotal = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
  const prevTotal = chartData.datasets[1].data.reduce((sum, val) => sum + (val || 0), 0);
  const difference = currentTotal - prevTotal;
  const percentChange = prevTotal > 0 ? ((difference / prevTotal) * 100).toFixed(1) : 0;

  //Table of contents
  const columns = [
    { header: 'Day', accessor: 'day' },
    {
      header: `${chartData.currentMonthName} ${currentYear}`,
      accessor: 'current',
      render: (row) => formatCurrency(row.current)
    },
    {
      header: `${chartData.prevMonthName} ${chartData.prevYear}`,
      accessor: 'previous',
      render: (row) => formatCurrency(row.previous)
    }
  ];

  const data = Array.from({ length: chartData.maxDays }, (_, i) => ({
    day: (i + 1).toString(),
    current: chartData.datasets[0].data[i] || 0,
    previous: chartData.datasets[1].data[i] || 0
  }));

  const exportData = useMemo(() => 
    data.map(row => ({
      Day: row.day,
      [`${chartData.currentMonthName} ${currentYear}`]: row.current,
      [`${chartData.prevMonthName} ${chartData.prevYear}`]: row.previous
    })),
    [data, chartData, currentYear]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" id="daily-comparison-export">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daily Comparison</h3>
          <p className="text-xs text-gray-500 mt-1">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              {chartData.currentMonthName} {currentYear} (Current)
            </span>
            <span className="ml-4 inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              {chartData.prevMonthName} {chartData.prevYear} (Previous)
            </span>
          </p>
        </div>
        <ExportButton
          elementId="daily-comparison-export"
          filename={`daily-comparison-${chartData.currentMonthName}-${currentYear}`}
          title="Daily Comparison"
          data={exportData}
          type="chart"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-medium">Current Month</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(currentTotal)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 font-medium">Previous Month</p>
          <p className="text-lg font-bold text-red-700">{formatCurrency(prevTotal)}</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${difference >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium ${difference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
            Difference
          </p>
          <p className={`text-lg font-bold ${difference >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
            {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
          </p>
        </div>
        <div className={`rounded-lg p-3 text-center ${percentChange >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium ${percentChange >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
            % Change
          </p>
          <p className={`text-lg font-bold ${percentChange >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
            {percentChange >= 0 ? '+' : ''}{percentChange}%
          </p>
        </div>
      </div>

      {/* Chart with Total Display */}
      <div className="relative mb-6">
        <div className="flex justify-between items-start mb-2 px-2">
          <div className="text-center flex-1">
            <p className="text-xs text-blue-600 font-semibold">Total: {formatCurrency(currentTotal)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-red-600 font-semibold">Total: {formatCurrency(prevTotal)}</p>
          </div>
        </div>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Daily Breakdown</h4>
        <div className="max-h-96 overflow-y-auto">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
};

export default DailyComparisonChart;
