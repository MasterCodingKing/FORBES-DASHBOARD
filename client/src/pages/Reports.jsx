import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();

  const reportTypes = [
    {
      id: 'monthly-revenue',
      title: 'MONTHLY REVENUE',
      description: 'View monthly revenue trends and analysis',
      path: '/reports/monthly-revenue'
    },
    {
      id: 'monthly-income',
      title: 'MONTHLY INCOME',
      description: 'View monthly income trends and analysis',
      path: '/reports/monthly-income'
    },
    {
      id: 'month-to-month',
      title: 'MONTH TO MONTH COMPARATIVE',
      description: 'Compare revenue and income between months',
      path: '/reports/month-to-month'
    },
    {
      id: 'ytd-sales',
      title: 'YEAR TO DATE COMPARATIVE - SALES',
      description: 'Compare year-to-date sales performance',
      path: '/reports/ytd-sales'
    },
    {
      id: 'ytd-income',
      title: 'YEAR TO DATE COMPARATIVE - INCOME',
      description: 'Compare year-to-date income performance',
      path: '/reports/ytd-income'
    },
    {
      id: 'monthly-projection',
      title: 'MONTHLY PROJECTION AS OF DECEMBER',
      description: 'View monthly projections and targets',
      path: '/reports/monthly-projection'
    },
    {
      id: 'monthly-service',
      title: 'MONTHLY SERVICE BREAKDOWN',
      description: 'View monthly service breakdown and analysis',
      path: '/reports/monthly-service'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and view detailed business reports</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {report.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(report.path)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
