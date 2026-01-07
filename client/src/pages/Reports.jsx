import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasReportAccess } from '../utils/permissions';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const reportTypes = [
    {
      id: 'dashboard-summary',
      title: 'DASHBOARD SUMMARY',
      description: 'Executive dashboard consolidating all charts and key metrics in a single view',
      path: '/reports/dashboard-summary',
      featured: true
    },
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
    },
    {
      id: 'monthly-expense',
      title: 'MONTHLY EXPENSE REPORT',
      description: 'View monthly expense breakdown by category',
      path: '/reports/monthly-expense'
    }
  ];

  // Filter reports based on user's allowed_reports
  const accessibleReports = reportTypes.filter(report => hasReportAccess(user, report.id));

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
        {accessibleReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Reports Available</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have access to any reports. Contact an administrator.</p>
          </div>
        ) : (
          <>
            {/* Featured Dashboard Summary */}
            {accessibleReports.filter(r => r.featured).map((report) => (
          <div
            key={report.id}
            className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">EXECUTIVE VIEW</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {report.title}
                  </h3>
                  <p className="text-white/80 text-base">
                    {report.description}
                  </p>
                </div>
                <button
                  onClick={() => navigate(report.path)}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Open Dashboard
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleReports.filter(r => !r.featured).map((report) => (
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
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
