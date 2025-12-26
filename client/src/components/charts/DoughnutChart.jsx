import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';
import { CHART_PALETTE } from '../../utils/constants';

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const DoughnutChart = ({
  labels,
  data,
  title,
  height = 300,
  showLegend = true,
  cutout = '60%',
  showValues = true
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    pldatalabels: {
        display: showValues,
        color: '#ffffff',
        font: {
          size: 11,
          weight: 'bold'
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : ''; // Only show if > 5%
        }
      },
      ugins: {
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
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
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP'
            }).format(value);
            return `${label}: ${formattedValue} (${percentage}%)`;
          }
        }
      }
    },
    cutout
  };

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: CHART_PALETTE,
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  return (
    <div style={{ height }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

export default DoughnutChart;
