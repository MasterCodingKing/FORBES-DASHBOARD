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

const LineChart = ({
  data,
  options: customOptions,
  labels,
  datasets,
  title,
  height = 300,
  showLegend = true,
  fill = false,
  showValues = false
}) => {
  const chartLabels = data?.labels || labels || [];
  const chartDatasets = data?.datasets || datasets || [];

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 40,
        top: 40
      }
    },
    plugins: {
      datalabels: {
        display: showValues,
        color: function(context) {
          const value = context.dataset.data[context.dataIndex];
          if (value < 0) {
            return '#ef4444'; // Red for negative values
          }
          return context.dataset.borderColor || '#3b82f6';
        },
        anchor: 'end',
        align: 'top',
        offset: 10,
        clip: false,
        skip: function(context) {
          // Show every other point if there are many data points
          const dataLength = context.dataset.data.length;
          if (dataLength > 25) {
            return context.dataIndex % 3 !== 0;
          } else if (dataLength > 15) {
            return context.dataIndex % 2 !== 0;
          }
          return false;
        },
        formatter: (value) => {
          if (!value || value === 0) return '';
          return value.toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        },
        font: {
          size: 10,
          weight: 'bold',
          family: "'Segoe UI', 'Helvetica Neue', sans-serif"
        }
      },
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              const formattedValue = value.toLocaleString('en-PH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              });
              // Return with color styling for negative values
              if (value < 0) {
                label += '₱' + formattedValue + ' ❌'; // Red indicator for negative
              } else {
                label += '₱' + formattedValue;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Merge custom options with default options
  const mergedOptions = customOptions || defaultOptions;

  const chartData = {
    labels: chartLabels,
    datasets: chartDatasets.map(ds => ({
      ...ds,
      tension: ds.tension !== undefined ? ds.tension : 0.4,
      fill: ds.fill !== undefined ? ds.fill : fill,
      pointRadius: ds.pointRadius !== undefined ? ds.pointRadius : 4,
      pointHoverRadius: ds.pointHoverRadius !== undefined ? ds.pointHoverRadius : 6
    }))
  };

  return (
    <div style={{ height }}>
      <Line options={mergedOptions} data={chartData} />
    </div>
  );
};

export default LineChart;
