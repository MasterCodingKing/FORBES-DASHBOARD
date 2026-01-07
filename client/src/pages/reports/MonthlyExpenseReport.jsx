import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useToast } from '../../components/common/Toast';
import BarChart from '../../components/charts/BarChart';

// Predefined colors for categories
const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const MonthlyExpenseReport = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenseData, setExpenseData] = useState(null);
  
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
      const response = await dashboardService.getExpenseBreakdown(selectedYear);
      setExpenseData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expense data');
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

  // Get color for a category
  const getCategoryColor = (index) => {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  };

  const handleExport = async (format) => {
    const filename = `Monthly-Expense-Report-${months[selectedMonth - 1]}-${selectedYear}`;
    
    try {
      if (format === 'png') {
        document.getElementById('detailed-table-expense').style.display = 'none';
        document.getElementById('export-table-expense').style.display = 'block';
        await exportToPNG('report-content', filename);
        document.getElementById('detailed-table-expense').style.display = 'block';
        document.getElementById('export-table-expense').style.display = 'none';
        toast.success('Report exported as PNG successfully');
      } else if (format === 'pdf') {
        document.getElementById('detailed-table-expense').style.display = 'none';
        document.getElementById('export-table-expense').style.display = 'block';
        await exportToPDF('report-content', filename, 'Monthly Expense Report');
        document.getElementById('detailed-table-expense').style.display = 'block';
        document.getElementById('export-table-expense').style.display = 'none';
        toast.success('Report exported as PDF successfully');
      } else if (format === 'excel') {
        // Create excel data with months as rows and categories as columns
        const data = expenseData?.months?.slice(0, selectedMonth).map(m => {
          const row = { Month: m.monthName };
          expenseData.categories.forEach(cat => {
            row[cat] = m.categories[cat] || 0;
          });
          row['Total'] = m.total;
          return row;
        }) || [];
        
        // Add totals row
        const totalsRow = { Month: 'TOTAL' };
        expenseData?.categories?.forEach(cat => {
          totalsRow[cat] = expenseData.categoryTotals[cat] || 0;
        });
        totalsRow['Total'] = expenseData?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + m.total, 0) || 0;
        data.push(totalsRow);
        
        exportToExcel(data, filename);
        toast.success('Report exported as Excel successfully');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Prepare chart data
  const chartLabels = expenseData?.months?.slice(0, selectedMonth).map(m => m.monthName.substring(0, 3).toUpperCase()) || [];
  const chartDatasets = expenseData?.categories?.map((cat, index) => ({
    label: cat,
    data: expenseData.months.slice(0, selectedMonth).map(m => m.categories[cat] || 0),
    backgroundColor: getCategoryColor(index),
    borderRadius: 4
  })) || [];

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
            <h1 className="text-2xl font-bold text-gray-800">MONTHLY EXPENSE REPORT</h1>
            <p className="text-gray-500">Expense breakdown by category</p>
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
          <h2 className="text-xl font-bold text-gray-900">EXPENSE BREAKDOWN BY CATEGORY</h2>
          <p className="text-gray-500">January - {months[selectedMonth - 1]} {selectedYear}</p>
        </div>

        {/* Stacked Bar Chart */}
        <div className="h-96 mb-8 bg-gray-50 rounded-lg p-4">
          {expenseData && chartDatasets.length > 0 ? (
            <BarChart
              labels={chartLabels}
              datasets={chartDatasets}
              height={350}
              showLegend={true}
              stacked={true}
              showValues={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No expense data available for the selected period
            </div>
          )}
        </div>

        {/* Category Summary Cards */}
        {expenseData?.categories?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Totals (YTD up to {months[selectedMonth - 1]})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {expenseData.categories.map((cat, index) => {
                const total = expenseData.months.slice(0, selectedMonth).reduce((sum, m) => sum + (m.categories[cat] || 0), 0);
                return (
                  <div 
                    key={cat} 
                    className="bg-gray-50 rounded-lg p-4 border-l-4"
                    style={{ borderLeftColor: getCategoryColor(index) }}
                  >
                    <div className="text-sm text-gray-600 truncate" title={cat}>{cat}</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(total)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Table */}
        <div id="detailed-table-expense" className="overflow-x-auto mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Monthly Expense Breakdown</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-red-600 text-white px-4 py-2 text-left font-semibold sticky left-0">Month</th>
                {expenseData?.categories?.map((cat, index) => (
                  <th 
                    key={cat} 
                    className="border border-gray-300 text-white px-4 py-2 text-right font-semibold whitespace-nowrap"
                    style={{ backgroundColor: getCategoryColor(index) }}
                  >
                    {cat}
                  </th>
                ))}
                <th className="border border-gray-300 bg-gray-800 text-white px-4 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {expenseData?.months?.slice(0, selectedMonth).map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 font-medium sticky left-0 bg-inherit">{m.monthName}</td>
                  {expenseData.categories.map(cat => (
                    <td key={cat} className="border border-gray-300 px-4 py-2 text-right">
                      {formatCurrency(m.categories[cat] || 0)}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold bg-gray-100">
                    {formatCurrency(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-red-100 font-bold">
                <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-red-100">TOTAL</td>
                {expenseData?.categories?.map(cat => {
                  const total = expenseData.months.slice(0, selectedMonth).reduce((sum, m) => sum + (m.categories[cat] || 0), 0);
                  return (
                    <td key={cat} className="border border-gray-300 px-4 py-2 text-right">
                      {formatCurrency(total)}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-4 py-2 text-right text-lg bg-red-200">
                  {formatCurrency(expenseData?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + m.total, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Simple Export Table - Hidden */}
        <div id="export-table-expense" className="overflow-x-auto" style={{display: 'none'}}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left font-semibold">Month</th>
                {expenseData?.categories?.map(cat => (
                  <th key={cat} className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">
                    {cat}
                  </th>
                ))}
                <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {expenseData?.months?.slice(0, selectedMonth).map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{m.monthName}</td>
                  {expenseData.categories.map(cat => (
                    <td key={cat} className="border border-gray-300 px-4 py-2 text-right">
                      {formatNum(m.categories[cat] || 0)}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                    {formatNum(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                {expenseData?.categories?.map(cat => {
                  const total = expenseData.months.slice(0, selectedMonth).reduce((sum, m) => sum + (m.categories[cat] || 0), 0);
                  return (
                    <td key={cat} className="border border-gray-300 px-4 py-2 text-right">
                      {formatNum(total)}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatNum(expenseData?.months?.slice(0, selectedMonth).reduce((sum, m) => sum + m.total, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseReport;
