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
      },
      datalabels: {
        display: showValues,
        color: '#fff',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value) => {
          if (!value) return '';
          return '₱' + (value / 1000).toFixed(0) + 'k';
        },
        anchor: 'end',
        align: 'end'
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
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: currentLabel,
        data: currentData,
        backgroundColor: CHART_COLORS.primary,
        borderRadius: 4
      },
      {
        label: previousLabel,
        data: previousData,
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
