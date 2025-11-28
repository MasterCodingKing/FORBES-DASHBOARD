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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({
  labels,
  datasets,
  title,
  height = 300,
  showLegend = true,
  horizontal = false,
  stacked = false
}) => {
  const options = {
    indexAxis: horizontal ? 'y' : 'x',
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
              const value = horizontal ? context.parsed.x : context.parsed.y;
              label += new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
              }).format(value);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: !horizontal
        },
        ticks: horizontal ? {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        } : {}
      },
      y: {
        stacked: stacked,
        beginAtZero: true,
        grid: {
          display: horizontal
        },
        ticks: !horizontal ? {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        } : {}
      }
    }
  };

  const data = {
    labels,
    datasets: datasets.map(ds => ({
      ...ds,
      borderRadius: 4,
      borderSkipped: false
    }))
  };

  return (
    <div style={{ height }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;
