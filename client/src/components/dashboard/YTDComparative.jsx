import { useMemo } from 'react';
import Card from '../common/Card';
import ComparativeChart from '../charts/ComparativeChart';
import Table from '../common/Table';
import ExportButton from '../common/ExportButton';
import { formatCurrency } from '../../utils/formatters';

const YTDComparative = ({ data, loading, type = 'sales' }) => {
  const title = type === 'sales' ? 'Year-to-Date Sales Comparison' : 'Year-to-Date Income Comparison';

  if (loading || !data) {
    return (
      <Card title={title} className="animate-pulse">
        <div className="h-80 bg-gray-200 rounded" />
      </Card>
    );
  }

  const { comparison, currentYearTotal, previousYearTotal, variance } = data;
  const currentYear = new Date().getFullYear();

  const exportData = useMemo(() => 
    comparison.map(c => ({
      Month: c.monthName,
      [`${currentYear}`]: c.currentYear,
      [`${currentYear - 1}`]: c.previousYear,
      Variance: c.variance
    })),
    [comparison, currentYear]
  );

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: `${currentYear}`, 
      render: (row) => formatCurrency(row.currentYear)
    },
    { 
      header: `${currentYear - 1}`, 
      render: (row) => formatCurrency(row.previousYear)
    },
    { 
      header: 'Variance', 
      render: (row) => (
        <span className={row.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.variance)}
        </span>
      )
    }
  ];

  return (
    <div id={`ytd-${type}-export`}>
      <Card 
        title={title}
        headerAction={
          <ExportButton
            elementId={`ytd-${type}-export`}
            filename={`ytd-${type}-comparison`}
            title={title}
            data={exportData}
            type="chart"
          />
        }
      >
      <ComparativeChart
        labels={comparison.map(c => c.monthName.substring(0, 3))}
        currentData={comparison.map(c => c.currentYear)}
        previousData={comparison.map(c => c.previousYear)}
        currentLabel={`${currentYear}`}
        previousLabel={`${currentYear - 1}`}
        height={300}
      />
      <div className="mt-6">
        <Table columns={columns} data={comparison} />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">{currentYear} Total</p>
              <p className="text-lg font-semibold">{formatCurrency(currentYearTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{currentYear - 1} Total</p>
              <p className="text-lg font-semibold">{formatCurrency(previousYearTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Variance</p>
              <p className={`text-lg font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(variance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default YTDComparative;
