import { formatCurrency } from '../../utils/formatters';

const DailyBreakdownTable = ({ data, serviceName, stats }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
        <p className="text-gray-500 text-center py-8">No data available for this period</p>
      </div>
    );
  }

  // Calculate running total
  let runningTotal = 0;
  const dataWithRunning = data.map(day => {
    runningTotal += day.total;
    return { ...day, runningTotal };
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Daily Breakdown {serviceName && `- ${serviceName}`}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Daily Target
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variance
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Running Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dataWithRunning.map((day) => (
              <tr key={day.day} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {day.day}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {day.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(day.total)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(day.target || 0)}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                  (day.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(day.variance || 0) >= 0 ? '+' : ''}{formatCurrency(day.variance || 0)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 text-right">
                  {formatCurrency(day.runningTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-gray-900">
                Total
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(stats?.sales ?? (dataWithRunning[dataWithRunning.length - 1]?.runningTotal || 0))}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                {formatCurrency(stats?.target || 0)}
              </td>
              <td className={`px-4 py-3 text-sm font-semibold text-right ${
                (stats?.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.difference || 0) >= 0 ? '+' : ''}{formatCurrency(stats?.difference || 0)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailyBreakdownTable;
