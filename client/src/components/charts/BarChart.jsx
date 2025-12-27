import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BarChart = ({
  labels,
  datasets,
  title,
  height = 300,
  showLegend = true,
  horizontal = false,
  stacked = false,
  showValues = true
}) => {
  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: showValues,
        color: function(context) {
          return context.dataset.backgroundColor || '#3b82f6';
        },
        anchor: 'end',
        align: 'end',
        offset: 4,
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
              const value = horizontal ? context.parsed.x : context.parsed.y;
              label += new Intl.NumberFormat('en-PH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
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
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
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
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          }
        } : {}
      }
    }
  };

  // Filter out zero values from labels and datasets
  const filteredData = (() => {
    if (!labels || !datasets) return { labels: [], datasets: [] };
    
    // Find indices where at least one dataset has a non-zero value
    const validIndices = labels.map((_, idx) => {
      return datasets.some(ds => ds.data && ds.data[idx] && ds.data[idx] !== 0);
    }).map((isValid, idx) => isValid ? idx : -1).filter(idx => idx !== -1);
    
    // If all values are zero or no valid data, show all
    if (validIndices.length === 0) {
      return {
        labels,
        datasets: datasets.map(ds => ({
          ...ds,
          borderRadius: 4,
          borderSkipped: false
        }))
      };
    }
    
    // Filter labels and dataset data
    const filteredLabels = validIndices.map(idx => labels[idx]);
    const filteredDatasets = datasets.map(ds => ({
      ...ds,
      data: validIndices.map(idx => ds.data[idx]),
      borderRadius: 4,
      borderSkipped: false
    }));
    
    return { labels: filteredLabels, datasets: filteredDatasets };
  })();

  return (
    <div style={{ height }}>
      <Bar options={options} data={filteredData} />
    </div>
  );
};

export default BarChart;
