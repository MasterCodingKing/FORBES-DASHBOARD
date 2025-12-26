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
import { formatCurrency } from '../../utils/formatters';
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
        color: '#1f2937',
        align: 'top',
        formatter: (value) => {
          if (!value || value === 0) return '';
          return '₱' + value.toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        },
        font: {
          size: 8,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${formatCurrency(value || 0)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '₱' + value.toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Day-to-Day Comparison
        </h3>
        <ExportButton
          elementId="daily-comparison-export"
          filename={`daily-comparison-${chartData.currentMonthName}-${currentYear}`}
          title="Day-to-Day Comparison"
          data={exportData}
          type="chart"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {/* Chart */}
      <div className="h-80 mb-6">
        <Line data={chartData} options={options} />
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
