import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import BarChart from '../../components/charts/BarChart';

const MonthlyServiceBreakdownReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [yearlyData, setYearlyData] = useState(null);
  const [servicesList, setServicesList] = useState([]);
  
  const reportRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = useMemo(() => {
    const result = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 4; y <= currentYear + 1; y++) result.push(y);
    return result;
  }, []);

  // Update services list when yearlyData changes
  useEffect(() => {
    if (yearlyData && yearlyData.departments && Array.isArray(yearlyData.departments)) {
      setServicesList(yearlyData.departments);
    }
  }, [yearlyData]);

  // Fetch yearly service breakdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await dashboardService.getYearlyServiceBreakdown(selectedYear);
        setYearlyData(response.data?.data || response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear]);

  const formatNum = (num) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(num || 0);
  };

  // Prepare chart data based on filters
  const chartData = useMemo(() => {
    if (!yearlyData || !yearlyData.months) return null;

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];

    // Case 1: Specific Service + Specific Month
    if (selectedService !== 'all' && selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth) - 1;
      const monthData = yearlyData.months[monthIndex];
      if (!monthData) return null;
      
      const serviceTotal = monthData.services[selectedService] || 0;
      
      return {
        labels: [`${selectedService} - ${monthData.monthName} ${selectedYear}`],
        datasets: [{
          label: 'Total Sales',
          data: [serviceTotal],
          backgroundColor: colors[0],
          borderColor: colors[0],
          borderWidth: 2
        }],
        type: 'bar'
      };
    }
    
    // Case 2: Specific Service + All Months
    if (selectedService !== 'all' && selectedMonth === 'all') {
      const labels = yearlyData.months.map(m => m.monthName.substring(0, 3));
      const data = yearlyData.months.map(m => m.services[selectedService] || 0);
      
      return {
        labels,
        datasets: [{
          label: `${selectedService} - ${selectedYear}`,
          data,
          backgroundColor: colors[0],
          borderColor: colors[0],
          borderWidth: 2
        }],
        type: 'bar'
      };
    }
    
    // Case 3: All Services + Specific Month
    if (selectedService === 'all' && selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth) - 1;
      const monthData = yearlyData.months[monthIndex];
      if (!monthData) return null;
      
      const labels = yearlyData.departments;
      const data = labels.map(deptName => monthData.services[deptName] || 0);
      
      return {
        labels,
        datasets: [{
          label: `${monthData.monthName} ${selectedYear}`,
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2
        }],
        type: 'bar'
      };
    }
    
    // Case 4: All Services + All Months
    if (selectedService === 'all' && selectedMonth === 'all') {
      const labels = yearlyData.months.map(m => m.monthName.substring(0, 3));
      
      const datasets = yearlyData.departments.map((deptName, idx) => ({
        label: deptName,
        data: yearlyData.months.map(m => m.services[deptName] || 0),
        backgroundColor: colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 2
      }));
      
      return { labels, datasets, type: 'bar' };
    }

    return null;
  }, [yearlyData, selectedMonth, selectedService, selectedYear]);

  // Prepare table data based on filters
  const tableData = useMemo(() => {
    if (!yearlyData || !yearlyData.months) return null;

    // Case 1: Specific Service + Specific Month - Show single row
    if (selectedService !== 'all' && selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth) - 1;
      const monthData = yearlyData.months[monthIndex];
      if (!monthData) return null;
      
      const serviceTotal = monthData.services[selectedService] || 0;
      
      return {
        type: 'single',
        headers: ['Service', 'Month', 'Year', 'Total Sales'],
        rows: [{
          service: selectedService,
          month: monthData.monthName,
          year: selectedYear,
          total: serviceTotal
        }]
      };
    }
    
    // Case 2: Specific Service + All Months - Show monthly breakdown
    if (selectedService !== 'all' && selectedMonth === 'all') {
      const rows = yearlyData.months.map((m, idx) => ({
        service: selectedService,
        month: m.monthName,
        year: selectedYear,
        total: m.services[selectedService] || 0
      }));
      
      const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
      
      return {
        type: 'service-monthly',
        headers: ['Service', 'Month', 'Year', 'Total Sales'],
        rows,
        grandTotal
      };
    }
    
    // Case 3: All Services + Specific Month - Show services breakdown
    if (selectedService === 'all' && selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth) - 1;
      const monthData = yearlyData.months[monthIndex];
      if (!monthData) return null;
      
      const rows = yearlyData.departments.map(serviceName => ({
        service: serviceName,
        month: monthData.monthName,
        year: selectedYear,
        total: monthData.services[serviceName] || 0
      }));
      
      const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
      
      return {
        type: 'month-services',
        headers: ['Service', 'Month', 'Year', 'Total Sales'],
        rows,
        grandTotal
      };
    }
    
    // Case 4: All Services + All Months - Show full breakdown
    if (selectedService === 'all' && selectedMonth === 'all') {
      const rows = [];
      
      yearlyData.departments.forEach(serviceName => {
        yearlyData.months.forEach(monthData => {
          rows.push({
            service: serviceName,
            month: monthData.monthName,
            year: selectedYear,
            total: monthData.services[serviceName] || 0
          });
        });
      });
      
      const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
      
      return {
        type: 'all',
        headers: ['Service', 'Month', 'Year', 'Total Sales'],
        rows,
        grandTotal
      };
    }

    return null;
  }, [yearlyData, selectedMonth, selectedService, selectedYear]);

  const handleExport = async (format) => {
    const serviceDesc = selectedService === 'all' ? 'All-Services' : selectedService;
    const monthDesc = selectedMonth === 'all' ? 'All-Months' : months[selectedMonth - 1];
    const filename = `Service-Breakdown_${serviceDesc}_${monthDesc}_${selectedYear}`;
    
    if (format === 'png') {
      await exportToPNG('report-content', filename);
    } else if (format === 'pdf') {
      await exportToPDF('report-content', filename, 'Monthly Service Breakdown Report');
    } else if (format === 'excel') {
      if (!tableData || !tableData.rows) return;
      
      const excelData = tableData.rows.map(row => ({
        Service: row.service,
        Month: row.month,
        Year: row.year,
        'Total Sales': row.total
      }));
      
      if (tableData.grandTotal !== undefined) {
        excelData.push({
          Service: 'GRAND TOTAL',
          Month: '',
          Year: '',
          'Total Sales': tableData.grandTotal
        });
      }
      
      exportToExcel(excelData, filename);
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
            <h1 className="text-2xl font-bold text-gray-800">MONTHLY SERVICE BREAKDOWN</h1>
            <p className="text-gray-500">Service sales breakdown by month and day</p>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="all">All Services</option>
              {servicesList.map((serviceName, index) => (
                <option key={index} value={serviceName}>{serviceName}</option>
              ))}
            </select>
          </div>
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
          <h2 className="text-xl font-bold text-gray-900">
            Monthly Service Breakdown Report
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedService !== 'all' && <span className="font-semibold">{selectedService}</span>}
            {selectedService !== 'all' && selectedMonth !== 'all' && <span> - </span>}
            {selectedMonth !== 'all' && <span className="font-semibold">{months[selectedMonth - 1]}</span>}
            {(selectedService !== 'all' || selectedMonth !== 'all') && <span> - </span>}
            <span className="font-semibold">{selectedYear}</span>
          </p>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Breakdown</h3>
          <div className="h-96 bg-gray-50 rounded-lg p-4">
            {chartData ? (
              <BarChart
                labels={chartData.labels}
                datasets={chartData.datasets}
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
          <div className="overflow-x-auto">
            {tableData && tableData.rows && tableData.rows.length > 0 ? (
              <div className={tableData.type === 'all' ? 'max-h-96 overflow-y-auto' : ''}>
                <table className="w-full text-sm border-collapse">
                  <thead className={tableData.type === 'all' ? 'sticky top-0' : ''}>
                    <tr>
                      {tableData.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className={`border border-gray-400 px-4 py-3 bg-blue-900 text-white ${
                            header === 'Total Sales' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className="bg-white hover:bg-gray-50">
                        {tableData.headers.includes('Service') && (
                          <td className="border border-gray-400 px-4 py-2">{row.service}</td>
                        )}
                        {tableData.headers.includes('Month') && (
                          <td className="border border-gray-400 px-4 py-2">{row.month}</td>
                        )}
                        {tableData.headers.includes('Year') && (
                          <td className="border border-gray-400 px-4 py-2">{row.year}</td>
                        )}
                        <td className="border border-gray-400 px-4 py-2 text-right font-semibold">
                          {formatCurrency(row.total)}
                        </td>
                      </tr>
                    ))}
                    {tableData.grandTotal !== undefined && (
                      <tr className="bg-blue-100 font-bold">
                        <td className="border border-gray-400 px-4 py-3" colSpan={tableData.headers.length - 1}>
                          GRAND TOTAL
                        </td>
                        <td className="border border-gray-400 px-4 py-3 text-right">
                          {formatCurrency(tableData.grandTotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyServiceBreakdownReport;
