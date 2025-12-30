import { useMemo } from 'react';
import Card from '../common/Card';
import ComparativeChart from '../charts/ComparativeChart';
import DataTable from '../common/DataTable';
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

  const { comparison, currentYearTotal, previousYearTotal, variance, year, currentYearTotalNOI, previousYearTotalNOI, totalNOIVariance } = data;
  // Use year from data if available, otherwise fallback to current year
  const currentYear = year || new Date().getFullYear();

  const exportData = useMemo(() => 
    comparison.map(c => ({
      Month: c.monthName,
      [`${currentYear}`]: c.currentYear,
      [`${currentYear - 1}`]: c.previousYear,
      'NOI Variance': c.noiVariance || 0,
      'Variance': c.variance
    })),
    [comparison, currentYear]
  );

  const columns = [
    { header: 'Month', accessor: 'monthName' },
    { 
      header: `${currentYear}`, 
      accessor: 'currentYear',
      render: (row) => formatCurrency(row.currentYear)
    },
    { 
      header: `${currentYear - 1}`, 
      accessor: 'previousYear',
      render: (row) => formatCurrency(row.previousYear)
    },
    { 
      header: 'Variance', 
      accessor: 'variance',
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
        title={`${title} (${currentYear})`}
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
      {/* Total Summary at the top */}
      <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
        <div className="grid grid-cols-5 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{currentYear} Total</p>
            <p className="text-base font-bold text-indigo-600">{formatCurrency(currentYearTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{currentYear - 1} Total</p>
            <p className="text-base font-bold text-gray-600">{formatCurrency(previousYearTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Variance</p>
            <p className={`text-base font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
            </p>
          </div>
          {currentYearTotalNOI !== undefined && (
            <>
              <div className="border-l pl-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{currentYear} NOI</p>
                <p className="text-base font-bold text-green-600">{formatCurrency(currentYearTotalNOI || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">NOI Variance</p>
                <p className={`text-base font-bold ${(totalNOIVariance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(totalNOIVariance || 0) >= 0 ? '+' : ''}{formatCurrency(totalNOIVariance || 0)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <ComparativeChart
        labels={comparison.map(c => c.monthName.substring(0, 3))}
        currentData={comparison.map(c => c.currentYear)}
        previousData={comparison.map(c => c.previousYear)}
        currentLabel={`${currentYear}`}
        previousLabel={`${currentYear - 1}`}
        height={250}
        showValues={true}
      />
      <div className="mt-6">
        <DataTable 
          columns={columns} 
          data={comparison} 
          defaultSortKey="month"
          defaultSortOrder="asc"
          searchable={false}
          rowsPerPageOptions={[12]}
          defaultRowsPerPage={12}
        />
      </div>
    </Card>
    </div>
  );
};

export default YTDComparative;
