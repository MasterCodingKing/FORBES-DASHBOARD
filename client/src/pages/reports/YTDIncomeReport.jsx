import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import BarChart from '../../components/charts/BarChart';

const YTDIncomeReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [prevYearIncome, setPrevYearIncome] = useState(null);
  
  const reportRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
      const prevYear = selectedYear - 1;

      const [incomeResp, prevIncomeResp] = await Promise.all([
        dashboardService.getYearlyIncome(selectedYear),
        dashboardService.getYearlyIncome(prevYear)
      ]);

      setMonthlyIncome(incomeResp.data);
      setPrevYearIncome(prevIncomeResp.data);
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

  const ytdData = useMemo(() => {
    const currentIncomeMonths = monthlyIncome?.months?.slice(0, selectedMonth) || [];
    const prevIncomeMonths = prevYearIncome?.months?.slice(0, selectedMonth) || [];
    
    const currIncTotal = currentIncomeMonths.reduce((sum, m) => sum + (m.income || 0), 0);
    const prevIncTotal = prevIncomeMonths.reduce((sum, m) => sum + (m.income || 0), 0);

    return {
      currentIncome: currIncTotal,
      previousIncome: prevIncTotal,
      incomeMonths: currentIncomeMonths,
      prevIncomeMonths: prevIncomeMonths
    };
  }, [monthlyIncome, prevYearIncome, selectedMonth]);

  const handleExport = async (format) => {
    const filename = `YTD-Income-Comparative-${months[selectedMonth - 1]}-${selectedYear}`;
    
    if (format === 'png') {
      await exportToPNG('report-content', filename);
    } else if (format === 'pdf') {
      await exportToPDF('report-content', filename, 'Year to Date Comparative - Income Report');
    } else if (format === 'excel') {
      const data = ytdData.incomeMonths?.map((m, i) => ({
        Month: m.monthName,
        [selectedYear]: m.income,
        [selectedYear - 1]: ytdData.prevIncomeMonths?.[i]?.income || 0
      }));

      // calculate totals
      const totalCurrentYear = data.reduce(
        (sum, row) => sum + (row[selectedYear] || 0),
        0
      );

      const totalPrevYear = data.reduce(
        (sum, row) => sum + (row[selectedYear - 1] || 0),
        0
      );

      // add total row
      data.push({
        Month: "Total",
        [selectedYear]: totalCurrentYear, 
        [selectedYear - 1]: totalPrevYear
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
            <h1 className="text-2xl font-bold text-gray-800">YEAR TO DATE COMPARATIVE - INCOME</h1>
            <p className="text-gray-500">Compare year-to-date income performance</p>
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
      <div id="report-content" ref={reportRef} className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-yellow-500">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">INCOME PERFORMANCE ANALYSIS</h2>
        </div>

        {/* Summary Box */}
        <div className="flex justify-end mb-4">
          <table className="text-sm border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear - 1}</td>
                <td className={`border border-gray-400 px-4 py-1 text-right ${ytdData.previousIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatNum(ytdData.previousIncome)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear}</td>
                <td className={`border border-gray-400 px-4 py-1 text-right ${ytdData.currentIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatNum(ytdData.currentIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg p-4">
          <BarChart
            labels={monthsShort.slice(0, selectedMonth)}
            datasets={[
              {
                label: String(selectedYear - 1),
                data: ytdData.prevIncomeMonths?.map(m => m.income) || [],
                backgroundColor: '#67C5E3'
              },
              {
                label: String(selectedYear),
                data: ytdData.incomeMonths?.map(m => m.income) || [],
                backgroundColor: '#F97316'
              }
            ]}
            height={280}
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-400 bg-blue-100 px-2 py-1 text-center">YEAR</th>
                {monthsShort.slice(0, selectedMonth).map((m, i) => (
                  <th key={i} className="border border-gray-400 bg-gray-100 px-2 py-1 text-center">{m}</th>
                ))}
                <th className="border border-gray-400 bg-gray-200 px-2 py-1 text-center">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-2 py-1 font-bold text-center">{selectedYear - 1}</td>
                {ytdData.prevIncomeMonths?.map((m, i) => (
                  <td key={i} className={`border border-gray-400 px-2 py-1 text-right ${m.income < 0 ? 'text-red-600' : ''}`}>
                    {m.income < 0 ? '- ' : ''}{formatNum(Math.abs(m.income))}
                  </td>
                ))}
                <td className={`border border-gray-400 px-2 py-1 text-right font-bold ${ytdData.previousIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatNum(ytdData.previousIncome)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-2 py-1 font-bold text-center">{selectedYear}</td>
                {ytdData.incomeMonths?.map((m, i) => (
                  <td key={i} className={`border border-gray-400 px-2 py-1 text-right ${m.income < 0 ? 'text-red-600' : ''}`}>
                    {m.income < 0 ? '- ' : ''}{formatNum(Math.abs(m.income))}
                  </td>
                ))}
                <td className={`border border-gray-400 px-2 py-1 text-right font-bold ${ytdData.currentIncome < 0 ? 'text-red-600' : ''}`}>
                  {formatNum(ytdData.currentIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YTDIncomeReport;
