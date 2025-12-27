import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import LineChart from '../../components/charts/LineChart';

const MonthlyRevenueReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  
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
          <h2 className="text-xl font-bold text-gray-900">CHARTS</h2>
        </div>

        {/* Chart */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg p-4">
          {monthlyRevenue && (
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
        </div>

        {/* Detailed Table - Visible in UI */}
        <div id="detailed-table" className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left font-semibold">Month</th>
                {serviceBreakdown?.departments?.map(dept => (
                  <th key={dept} className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">{dept}</th>
                ))}
                <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {serviceBreakdown?.months?.slice(0, selectedMonth).map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{m.monthName}</td>
                  {serviceBreakdown.departments.map(dept => (
                    <td key={dept} className="border border-gray-300 px-4 py-2 text-right">
                      {formatNum(m.services[dept] || 0)}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatNum(m.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                {serviceBreakdown?.departments?.map(dept => (
                  <td key={dept} className="border border-gray-300 px-4 py-2 text-right">
                    {formatNum(serviceBreakdown.months?.slice(0, selectedMonth).reduce((sum, m) => sum + (m.services[dept] || 0), 0))}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatNum(serviceBreakdown?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + (m.total || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Simple Table - Hidden, only for exports */}
        <div id="export-table" className="overflow-x-auto" style={{display: 'none'}}>
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
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueReport;
