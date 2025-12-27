import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ComparativeChart = ({
  labels,
  currentData,
  previousData,
  currentLabel = 'Current Year',
  previousLabel = 'Previous Year',
  title,
  height = 300,
  showValues = false
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
              label += new Intl.NumberFormat('en-PH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      datalabels: {
        display: showValues,
        color: function(context) {
          return context.dataset.backgroundColor || '#3b82f6';
        },
        font: {
          weight: 'bold',
          size: 10,
          family: "'Segoe UI', 'Helvetica Neue', sans-serif"
        },
        skip: function(context) {
          // Don't show label if value is 0
          return !context.dataset.data[context.dataIndex] || context.dataset.data[context.dataIndex] === 0;
        },
        formatter: (value) => {
          if (!value || value === 0) return '';
          const num = Math.round(value);
          if (num > 1000000) {
            return (num / 1000000).toFixed(0) + 'M';
          }
          return (num / 1000).toFixed(0) + 'K';
        },
        anchor: 'end',
        align: 'end',
        offset: 4
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
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          }
        }
      }
    }
  };

  // Filter out bars where both datasets have zero values
  const validIndices = labels.map((_, idx) => {
    return (currentData[idx] && currentData[idx] !== 0) || (previousData[idx] && previousData[idx] !== 0);
  }).map((isValid, idx) => isValid ? idx : -1).filter(idx => idx !== -1);

  const filteredLabels = validIndices.length > 0 ? validIndices.map(idx => labels[idx]) : labels;
  const filteredCurrentData = validIndices.length > 0 ? validIndices.map(idx => currentData[idx]) : currentData;
  const filteredPreviousData = validIndices.length > 0 ? validIndices.map(idx => previousData[idx]) : previousData;

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        label: currentLabel,
        data: filteredCurrentData,
        backgroundColor: CHART_COLORS.primary,
        borderRadius: 4
      },
      {
        label: previousLabel,
        data: filteredPreviousData,
        backgroundColor: CHART_COLORS.secondary,
        borderRadius: 4
      }
    ]
  };

  return (
    <div style={{ height }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default ComparativeChart;
