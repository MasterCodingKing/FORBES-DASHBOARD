import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import BarChart from '../../components/charts/BarChart';

const MonthToMonthReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  const [prevServiceBreakdown, setPrevServiceBreakdown] = useState(null);
  
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

      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevMonthYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

      const [breakdownResp, prevBreakdownResp] = await Promise.all([
        dashboardService.getServiceBreakdown(selectedYear, selectedMonth),
        dashboardService.getServiceBreakdown(prevMonthYear, prevMonth)
      ]);

      setServiceBreakdown(breakdownResp.data);
      setPrevServiceBreakdown(prevBreakdownResp.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNum = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevMonthYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const currentMonthName = months[selectedMonth - 1];
  const prevMonthName = months[prevMonth - 1];

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!serviceBreakdown || !prevServiceBreakdown) return null;

    const currentByDept = {};
    const prevByDept = {};

    serviceBreakdown.breakdown?.forEach(item => {
      currentByDept[item.departmentName] = item.revenue;
    });

    prevServiceBreakdown.breakdown?.forEach(item => {
      prevByDept[item.departmentName] = item.revenue;
    });

    const allDepts = new Set([
      ...Object.keys(currentByDept),
      ...Object.keys(prevByDept)
    ]);

    const comparison = Array.from(allDepts).map(dept => {
      const prev = prevByDept[dept] || 0;
      const curr = currentByDept[dept] || 0;
      const diff = curr - prev;
      const pct = prev > 0 ? ((diff / prev) * 100) : (curr > 0 ? 100 : 0);
      return {
        service: dept,
        previousMonth: prev,
        currentMonth: curr,
        difference: diff,
        percentChange: pct
      };
    }).sort((a, b) => b.currentMonth - a.currentMonth);

    const totalPrev = comparison.reduce((sum, c) => sum + c.previousMonth, 0);
    const totalCurr = comparison.reduce((sum, c) => sum + c.currentMonth, 0);
    const totalDiff = totalCurr - totalPrev;
    const totalPct = totalPrev > 0 ? ((totalDiff / totalPrev) * 100) : 0;

    return {
      comparison,
      totals: {
        previousMonth: totalPrev,
        currentMonth: totalCurr,
        difference: totalDiff,
        percentChange: totalPct
      }
    };
  }, [serviceBreakdown, prevServiceBreakdown]);

  const handleExport = async (format) => {
    const filename = `Month-to-Month-Comparative-${months[selectedMonth - 1]}-${selectedYear}`;
    
    if (format === 'png') {
      await exportToPNG('report-content', filename);
    } else if (format === 'pdf') {
      await exportToPDF('report-content', filename, 'Month to Month Comparative Report');
    } else if (format === 'excel') {
      const data = comparisonData?.comparison.map(row => ({
        Service: row.service,
        [prevMonthName]: row.previousMonth,
        [currentMonthName]: row.currentMonth,
        'Income/Less': row.difference,
        '%': `${row.percentChange.toFixed(0)}%`
      })) || [];
      // Calculate totals
      const totalPrev = data.reduce((sum, row) => sum + (row[prevMonthName] || 0), 0);
      const totalCurr = data.reduce((sum, row) => sum + (row[currentMonthName] || 0), 0);
      const totalDiff = totalCurr - totalPrev;
      const totalPct = totalPrev > 0 ? ((totalDiff / totalPrev) * 100) : 0;
      // Add total row
      data.push({
        Service: 'Total',
        [prevMonthName]: totalPrev,
        [currentMonthName]: totalCurr,
        'Income/Less': totalDiff,
        '%': `${totalPct.toFixed(0)}%`
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
            <h1 className="text-2xl font-bold text-gray-800">MONTH TO MONTH COMPARATIVE</h1>
            <p className="text-gray-500">Compare revenue between months</p>
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
          <h2 className="text-xl font-bold text-gray-900">COMPARATIVE ANALYSIS</h2>
        </div>

        {/* Chart */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg p-4">
          {comparisonData && (
            <BarChart
              labels={['REVENUE']}
              datasets={[
                {
                  label: prevMonthName.toUpperCase(),
                  data: [comparisonData.totals.previousMonth],
                  backgroundColor: '#4A90D9'
                },
                {
                  label: currentMonthName.toUpperCase(),
                  data: [comparisonData.totals.currentMonth],
                  backgroundColor: '#F97316'
                }
              ]}
              height={280}
            />
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-left">SERVICES</th>
                <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-right">{prevMonthName.toUpperCase()}</th>
                <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-right">{currentMonthName.toUpperCase()}</th>
                <th className="border border-gray-400 bg-orange-500 text-white px-3 py-2 text-right">DIFFERENCE</th>
                <th className="border border-gray-400 bg-orange-500 text-white px-3 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData?.comparison.map((row, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="border border-gray-400 px-3 py-1">{row.service}</td>
                  <td className="border border-gray-400 px-3 py-1 text-right">{formatNum(row.previousMonth)}</td>
                  <td className="border border-gray-400 px-3 py-1 text-right">{formatNum(row.currentMonth)}</td>
                  <td className={`border border-gray-400 px-3 py-1 text-right ${row.difference < 0 ? 'text-red-600' : ''}`}>
                    {row.difference < 0 ? '- ' : ''}{formatNum(Math.abs(row.difference))}
                  </td>
                  <td className={`border border-gray-400 px-3 py-1 text-right ${row.percentChange < 0 ? 'text-red-600' : ''}`}>
                    {row.percentChange.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-400 px-3 py-2">TOTAL REVENUE</td>
                <td className="border border-gray-400 px-3 py-2 text-right">{formatNum(comparisonData?.totals.previousMonth)}</td>
                <td className="border border-gray-400 px-3 py-2 text-right">{formatNum(comparisonData?.totals.currentMonth)}</td>
                <td className={`border border-gray-400 px-3 py-2 text-right ${comparisonData?.totals.difference < 0 ? 'text-red-600' : ''}`}>
                  {formatNum(comparisonData?.totals.difference)}
                </td>
                <td className={`border border-gray-400 px-3 py-2 text-right ${comparisonData?.totals.percentChange < 0 ? 'text-red-600' : ''}`}>
                  {comparisonData?.totals.percentChange?.toFixed(0)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthToMonthReport;
