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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({
  data,
  options: customOptions,
  labels,
  datasets,
  title,
  height = 300,
  showLegend = true,
  fill = false
}) => {
  const chartLabels = data?.labels || labels || [];
  const chartDatasets = data?.datasets || datasets || [];

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
              label += new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
              }).format(context.parsed.y);
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
