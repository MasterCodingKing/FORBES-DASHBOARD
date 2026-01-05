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
  showValues = true,
  showPercentage = false,
  onClick = null
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onClick ? (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = chart.data.labels[index];
        const value = chart.data.datasets[0].data[index];
        onClick({ index, label, value });
      }
    } : undefined,
    plugins: {
      datalabels: {
        display: showValues,
        color: '#ffffff',
        font: {
          size: 10,
          weight: 'bold'
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(0);
          return percentage > 5 ? `${percentage}%` : ''; // Only show if > 5%
        }
      },
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: { size: 10 },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
                const formattedValue = formatter.format(value || 0);
                const text = showPercentage ? `${label} — ${formattedValue} (${percentage}%)` : `${label} — ${formattedValue}`;
                return {
                  text,
                  fillStyle: CHART_PALETTE[i % CHART_PALETTE.length],
                  strokeStyle: '#fff',
                  lineWidth: 1,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
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
