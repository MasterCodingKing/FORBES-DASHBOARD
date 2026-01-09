import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';

const MonthlyRevenueReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' or 'pie'
  
  const reportRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = useMemo(() => {
    const result = [];
    const cy = new Date().getFullYear();
    for (let y = cy - 4; y <= cy + 1; y++) result.push(y);
    return result;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [revenueResp, breakdownResp] = await Promise.all([
        dashboardService.getYearlyRevenue(selectedYear),
        dashboardService.getYearlyServiceBreakdown(selectedYear)
      ]);
      setMonthlyRevenue(revenueResp.data);
      setServiceBreakdown(breakdownResp.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNum = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

  const handleExport = async (format) => {
    const filename = `Monthly-Revenue-Trend-${months[selectedMonth - 1]}-${selectedYear}`;
    
    if (format === 'png') {
      // Hide detailed table and show simple table for export
      document.getElementById('detailed-table').style.display = 'none';
      document.getElementById('export-table').style.display = 'block';
      await exportToPNG('report-content', filename);
      // Restore original display
      document.getElementById('detailed-table').style.display = 'block';
      document.getElementById('export-table').style.display = 'none';
    } else if (format === 'pdf') {
      // Hide detailed table and show simple table for export
      document.getElementById('detailed-table').style.display = 'none';
      document.getElementById('export-table').style.display = 'block';
      await exportToPDF('report-content', filename, 'Monthly Revenue Trend Report');
      // Restore original display
      document.getElementById('detailed-table').style.display = 'block';
      document.getElementById('export-table').style.display = 'none';
    } else if (format === 'excel') {
      if (chartType === 'line') {
        const data = monthlyRevenue?.months?.slice(0, selectedMonth).map(m => ({
          Month: m.monthName,
          'Total Revenue': m.total
        })) || [];
        // Calculate total
        const totalRevenue = data.reduce((sum, row) => sum + (row['Total Revenue'] || 0), 0);
        // Add total row
        data.push({
          Month: 'Total',
          'Total Revenue': totalRevenue
        });
        exportToExcel(data, filename);
      } else {
        // Service breakdown export
        const services = serviceBreakdown?.months?.[selectedMonth - 1]?.services || {};
        const monthTotal = serviceBreakdown?.months?.[selectedMonth - 1]?.total || 0;
        const data = Object.entries(services).map(([service, revenue]) => {
          const percentage = monthTotal > 0 ? ((revenue / monthTotal) * 100).toFixed(1) : 0;
          return {
            Service: service,
            Revenue: revenue,
            Percentage: `${percentage}%`
          };
        });
        // Add total row
        data.push({
          Service: 'TOTAL',
          Revenue: monthTotal,
          Percentage: '100.0%'
        });
        exportToExcel(data, `Service-Breakdown-${months[selectedMonth - 1]}-${selectedYear}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">MONTHLY REVENUE TREND</h1>
            <p className="text-gray-500">Monthly revenue analysis report</p>
          </div>
        </div>
        
        {/* Filters and Export */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => handleExport('png')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            PNG
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Report Content */}
      <div id="report-content" ref={reportRef} className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">REVENUE TREND VISUALIZATION</h2>
        </div>

        {/* Chart Type Selector */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Line Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'pie'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Pie Chart
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg p-4">
          {monthlyRevenue && chartType === 'line' && (
            <LineChart
              labels={monthlyRevenue.months?.slice(0, selectedMonth).map(m => m.monthName.substring(0, 3).toUpperCase())}
              datasets={[{
                label: 'Total Revenue',
                data: monthlyRevenue.months?.slice(0, selectedMonth).map(m => m.total),
                borderColor: '#4A90D9',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#4A90D9'
              }]}
              height={280}
              showLegend={false}
              showValues={true}
            />
          )}
          {serviceBreakdown && chartType === 'pie' && (
            <PieChart
              labels={Object.keys(serviceBreakdown.months?.[selectedMonth - 1]?.services || {})}
              data={Object.values(serviceBreakdown.months?.[selectedMonth - 1]?.services || {})}
              height={280}
              showLegend={true}
              showValues={true}
              showPercentage={true}
              is3D={true}
            />
          )}
        </div>

        {/* Summary Table - Monthly Totals or Service Breakdown */}
        <div id="detailed-table" className="overflow-x-auto mb-6">
          {chartType === 'line' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Monthly Revenue Summary</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-blue-600 text-white px-4 py-2 text-left font-semibold">Month</th>
                    <th className="border border-gray-300 bg-blue-600 text-white px-4 py-2 text-right font-semibold">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenue?.months?.slice(0, selectedMonth).map((m, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{m.monthName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-lg">
                      {formatCurrency(monthlyRevenue?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + (m.total || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Service Breakdown - {months[selectedMonth - 1]} {selectedYear}
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-purple-600 text-white px-4 py-2 text-left font-semibold">Service</th>
                    <th className="border border-gray-300 bg-purple-600 text-white px-4 py-2 text-right font-semibold">Revenue</th>
                    <th className="border border-gray-300 bg-purple-600 text-white px-4 py-2 text-right font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceBreakdown?.months?.[selectedMonth - 1] && Object.entries(serviceBreakdown.months[selectedMonth - 1].services || {}).map(([service, revenue], i) => {
                    const monthTotal = serviceBreakdown.months[selectedMonth - 1].total || 0;
                    const percentage = monthTotal > 0 ? ((revenue / monthTotal) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">{service}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(revenue)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-lg">
                      {formatCurrency(serviceBreakdown?.months?.[selectedMonth - 1]?.total || 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-lg">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>

        {/* Simple Table - Hidden, only for exports */}
        <div id="export-table" className="overflow-x-auto" style={{display: 'none'}}>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-bold text-gray-900">
              {chartType === 'line' ? 'Monthly Revenue Report' : 'Service Breakdown Report'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {months[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
          {chartType === 'line' ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left font-semibold">Month</th>
                  <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue?.months?.slice(0, selectedMonth).map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{m.monthName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatNum(m.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNum(monthlyRevenue?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + (m.total || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left font-semibold">Service</th>
                  <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">Revenue</th>
                  <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {serviceBreakdown?.months?.[selectedMonth - 1] && Object.entries(serviceBreakdown.months[selectedMonth - 1].services || {}).map(([service, revenue], i) => {
                  const monthTotal = serviceBreakdown.months[selectedMonth - 1].total || 0;
                  const percentage = monthTotal > 0 ? ((revenue / monthTotal) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{service}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatNum(revenue)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNum(serviceBreakdown?.months?.[selectedMonth - 1]?.total || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">100.0%</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueReport;
