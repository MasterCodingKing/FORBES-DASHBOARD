import { useMemo } from 'react';
import Card from '../common/Card';
import DoughnutChart from '../charts/DoughnutChart';
import Table from '../common/Table';
import ExportButton from '../common/ExportButton';
import { formatCurrency } from '../../utils/formatters';

const ServiceBreakdown = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card title="Service Breakdown (Current Month)" className="animate-pulse">
        <div className="h-80 bg-gray-200 rounded" />
      </Card>
    );
  }

  const { breakdown, totalRevenue } = data;

  const exportData = useMemo(() => 
    breakdown.map(b => ({
      Service: b.departmentName,
      Revenue: b.revenue,
      Percentage: `${b.percentage}%`
    })),
    [breakdown]
  );

  const columns = [
    { header: 'Service', accessor: 'departmentName' },
    { 
      header: 'Revenue', 
      render: (row) => formatCurrency(row.revenue)
    },
    { 
      header: '%', 
      render: (row) => `${row.percentage}%`
    }
  ];

  return (
    <div id="service-breakdown-export">
      <Card 
        title="Service Breakdown (Current Month)"
        headerAction={
          <ExportButton
            elementId="service-breakdown-export"
            filename="service-breakdown"
            title="Service Breakdown"
            data={exportData}
            type="chart"
          />
        }
      >
      {breakdown.length > 0 ? (
        <>
          <DoughnutChart
            labels={breakdown.map(b => b.departmentName)}
            data={breakdown.map(b => b.revenue)}
            height={300}
            showValues={true}
          />
          <div className="mt-6">
            <Table
              columns={columns}
              data={breakdown}
            />
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Revenue</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for this month
        </div>
      )}
    </Card>
    </div>
  );
};

export default ServiceBreakdown;
