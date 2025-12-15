import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import salesService from '../services/salesService';
import departmentService from '../services/departmentService';
import { formatCurrency } from '../utils/formatters';
import { exportToPNG, exportToExcel } from '../utils/exportUtils';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import { CHART_COLORS, CHART_PALETTE } from '../utils/constants';

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedService, setSelectedService] = useState('');
  const [viewCategory, setViewCategory] = useState('All'); // 'All' or 'Graph'
  const [departments, setDepartments] = useState([]);
  
  // Data states
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [prevYearRevenue, setPrevYearRevenue] = useState(null);
  const [prevYearIncome, setPrevYearIncome] = useState(null);
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  const [prevServiceBreakdown, setPrevServiceBreakdown] = useState(null);
  const [salesData, setSalesData] = useState({});
  const [monthlyTargets, setMonthlyTargets] = useState([]);
  const [allSales, setAllSales] = useState([]);

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

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentService.getAll();
        setDepartments(response.data?.departments || response.data || []);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    loadDepartments();
  }, []);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const prevYear = selectedYear - 1;
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevMonthYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

      const [
        revenueResp,
        incomeResp,
        prevRevenueResp,
        prevIncomeResp,
        breakdownResp,
        prevBreakdownResp,
        salesResp
      ] = await Promise.all([
        dashboardService.getYearlyRevenue(selectedYear),
        dashboardService.getYearlyIncome(selectedYear),
        dashboardService.getYearlyRevenue(prevYear),
        dashboardService.getYearlyIncome(prevYear),
        dashboardService.getServiceBreakdown(selectedYear, selectedMonth),
        dashboardService.getServiceBreakdown(prevMonthYear, prevMonth),
        salesService.getAll({ month: selectedMonth, year: selectedYear, limit: 10000 })
      ]);

      setMonthlyRevenue(revenueResp.data);
      setMonthlyIncome(incomeResp.data);
      setPrevYearRevenue(prevRevenueResp.data);
      setPrevYearIncome(prevIncomeResp.data);
      setServiceBreakdown(breakdownResp.data);
      setPrevServiceBreakdown(prevBreakdownResp.data);
      setAllSales(salesResp.data?.sales || []);

      setSalesData({
        currentMonth: months[selectedMonth - 1],
        previousMonth: months[prevMonth - 1],
        currentYear: selectedYear,
        previousYear: prevMonthYear
      });

      // Calculate monthly targets/projection based on average
      const breakdown = breakdownResp.data?.breakdown || [];
      const avgMonthly = breakdown.map(dept => {
        const monthIdx = selectedMonth - 1;
        const avgRevenue = revenueResp.data?.months?.slice(0, monthIdx + 1).reduce((sum, m) => sum + (m.total || 0), 0) / (monthIdx + 1) || 0;
        const deptAvg = (dept.revenue / (revenueResp.data?.yearTotal || 1)) * avgRevenue;
        return {
          service: dept.departmentName,
          avgMonthly: deptAvg,
          monthlyTarget: dept.revenue * 1.35, // 35% higher target
          actual: dept.revenue
        };
      });
      setMonthlyTargets(avgMonthly);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Calculate month-to-month comparison data
  const comparisonData = useMemo(() => {
    if (!serviceBreakdown || !prevServiceBreakdown) return null;

    const currentByDept = {};
    const prevByDept = {};

    // Get current month breakdown
    serviceBreakdown.breakdown?.forEach(item => {
      currentByDept[item.departmentName] = item.revenue;
    });

    // Get previous month breakdown
    prevServiceBreakdown.breakdown?.forEach(item => {
      prevByDept[item.departmentName] = item.revenue;
    });

    // Combine all departments
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

    // Get income for current and previous month
    const prevMonthIdx = selectedMonth === 1 ? 11 : selectedMonth - 2;
    const currMonthIdx = selectedMonth - 1;
    const prevIncome = monthlyIncome?.months?.[prevMonthIdx]?.income || 0;
    const currIncome = monthlyIncome?.months?.[currMonthIdx]?.income || 0;
    const incomeDiff = currIncome - prevIncome;
    const incomePct = prevIncome !== 0 ? ((incomeDiff / Math.abs(prevIncome)) * 100) : 0;

    return {
      comparison,
      totals: {
        previousMonth: totalPrev,
        currentMonth: totalCurr,
        difference: totalDiff,
        percentChange: totalPct,
        prevIncome,
        currIncome,
        incomeDiff,
        incomePct
      }
    };
  }, [serviceBreakdown, prevServiceBreakdown, monthlyIncome, selectedMonth]);

  // Year-to-date totals
  const ytdData = useMemo(() => {
    const currentMonths = monthlyRevenue?.months?.slice(0, selectedMonth) || [];
    const prevMonths = prevYearRevenue?.months?.slice(0, selectedMonth) || [];
    
    const currRevTotal = currentMonths.reduce((sum, m) => sum + (m.total || 0), 0);
    const prevRevTotal = prevMonths.reduce((sum, m) => sum + (m.total || 0), 0);

    const currentIncomeMonths = monthlyIncome?.months?.slice(0, selectedMonth) || [];
    const prevIncomeMonths = prevYearIncome?.months?.slice(0, selectedMonth) || [];
    
    const currIncTotal = currentIncomeMonths.reduce((sum, m) => sum + (m.income || 0), 0);
    const prevIncTotal = prevIncomeMonths.reduce((sum, m) => sum + (m.income || 0), 0);

    return {
      currentRevenue: currRevTotal,
      previousRevenue: prevRevTotal,
      currentIncome: currIncTotal,
      previousIncome: prevIncTotal,
      revenueMonths: currentMonths,
      prevRevenueMonths: prevMonths,
      incomeMonths: currentIncomeMonths,
      prevIncomeMonths: prevIncomeMonths
    };
  }, [monthlyRevenue, prevYearRevenue, monthlyIncome, prevYearIncome, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportAll = async (format) => {
    if (format === 'png') {
      await exportToPNG('report-container', `report-${months[selectedMonth - 1]}-${selectedYear}`);
    } else if (format === 'excel') {
      const allData = [];
      
      // Monthly Revenue
      monthlyRevenue?.months?.forEach(m => {
        allData.push({
          Section: 'Monthly Revenue Trend',
          Month: m.monthName,
          'Total Revenue': m.total
        });
      });

      // Monthly Income
      monthlyIncome?.months?.forEach(m => {
        allData.push({
          Section: 'Monthly Income Trend',
          Month: m.monthName,
          Income: m.income
        });
      });

      // Month-to-Month
      comparisonData?.comparison?.forEach(row => {
        allData.push({
          Section: 'Month-to-Month Comparative',
          Service: row.service,
          [salesData.previousMonth]: row.previousMonth,
          [salesData.currentMonth]: row.currentMonth,
          'Income/Less': row.difference,
          '%': `${row.percentChange.toFixed(0)}%`
        });
      });

      // YTD Sales
      ytdData.revenueMonths?.forEach((m, i) => {
        allData.push({
          Section: 'YTD Comparative - Sales',
          Month: m.monthName,
          [selectedYear]: m.total,
          [selectedYear - 1]: ytdData.prevRevenueMonths?.[i]?.total || 0
        });
      });

      // Service Breakdown
      serviceBreakdown?.breakdown?.forEach(s => {
        allData.push({
          Section: 'Month End Report',
          Service: s.departmentName,
          Revenue: s.revenue,
          Percentage: `${s.percentage}%`
        });
      });

      exportToExcel(allData, `report-${months[selectedMonth - 1]}-${selectedYear}`);
    }
  };

  const handleSectionExport = async (sectionId, sectionName, format, data = null) => {
    if (format === 'png') {
      await exportToPNG(sectionId, `${sectionName}-${months[selectedMonth - 1]}-${selectedYear}`);
    } else if (format === 'excel' && data) {
      exportToExcel(data, `${sectionName}-${months[selectedMonth - 1]}-${selectedYear}`);
    } else if (format === 'print') {
      const section = document.getElementById(sectionId);
      if (section) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>' + sectionName + '</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#1e40af;color:white;}.text-right{text-align:right;}.text-red-600{color:#dc2626;}.font-bold{font-weight:bold;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(section.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const ExportButtons = ({ sectionId, sectionName, excelData }) => (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={() => handleSectionExport(sectionId, sectionName, 'print')}
        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        title="Print"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      </button>
      <button
        onClick={() => handleSectionExport(sectionId, sectionName, 'png')}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        title="Export PNG"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {excelData && (
        <button
          onClick={() => handleSectionExport(sectionId, sectionName, 'excel', excelData)}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          title="Export Excel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}
    </div>
  );

  // Filter sales by service
  const filteredSales = useMemo(() => {
    if (!selectedService) return allSales;
    return allSales.filter(sale => {
      const deptId = sale.department_id || sale.departmentId;
      return deptId === parseInt(selectedService);
    });
  }, [allSales, selectedService]);

  // Get filtered service breakdown
  const filteredServiceBreakdown = useMemo(() => {
    if (!selectedService || !serviceBreakdown) return serviceBreakdown;
    const filtered = serviceBreakdown.breakdown?.filter(s => {
      const dept = departments.find(d => d.name === s.departmentName);
      return dept && dept.id === parseInt(selectedService);
    });
    return {
      ...serviceBreakdown,
      breakdown: filtered,
      totalRevenue: filtered?.reduce((sum, s) => sum + s.revenue, 0) || 0
    };
  }, [serviceBreakdown, selectedService, departments]);

  // Format number with commas
  const formatNum = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="print:p-0">
      {/* Header - Hidden in print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Report</h1>
          <p className="text-gray-500">Generate and export comprehensive reports</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          <button
            onClick={() => handleExportAll('png')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Export PNG
          </button>

          <button
            onClick={() => handleExportAll('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 print:hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">All Services</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Category</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewCategory('All')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewCategory === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewCategory('Graph')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewCategory === 'Graph'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Graph
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <div className="bg-blue-50 rounded-lg p-4 w-full">
              <p className="text-xs text-blue-600 font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-blue-700">
                {formatNum(selectedService ? filteredServiceBreakdown?.totalRevenue : serviceBreakdown?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 print:hidden">
          {error}
        </div>
      )}

      {/* Sales List Table - Shows when a service is selected */}
      {selectedService && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sales List - {departments.find(d => d.id === parseInt(selectedService))?.name || 'Selected Service'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Service</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-700">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No sales found for this service
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, idx) => (
                    <tr key={sale.id || idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(sale.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {sale.department?.name || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                        {formatNum(sale.amount)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-600">
                        {sale.remarks || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredSales.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="2" className="border border-gray-300 px-4 py-2">Total</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {formatNum(filteredSales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Report Container */}
      <div id="report-container" ref={reportRef} className="space-y-8 bg-white">
        
        {/* 1. MONTHLY REVENUE TREND */}
        {(viewCategory === 'All' || viewCategory === 'Graph') && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">MONTHLY REVENUE TREND</h2>
            <ExportButtons 
              sectionId="monthly-revenue-section"
              sectionName="Monthly-Revenue-Trend"
              excelData={monthlyRevenue?.months?.slice(0, selectedMonth).map(m => ({
                Month: m.monthName,
                'Total Revenue': m.total
              }))}
            />
          </div>
          
          <div id="monthly-revenue-section" className="bg-white rounded shadow p-4">
            {/* Line Chart */}
            <div className="h-80 mb-4">
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
                  height={300}
                  showLegend={false}
                />
              )}
            </div>
            
            {/* Data Table Below Chart */}
            {viewCategory === 'All' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-200 px-2 py-1"></th>
                    {monthlyRevenue?.months?.slice(0, selectedMonth).map((m, i) => (
                      <th key={i} className="border border-gray-400 bg-blue-100 px-2 py-1 text-center font-medium text-blue-800">
                        {m.monthName.substring(0, 3).toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 font-medium">Total Revenue</td>
                    {monthlyRevenue?.months?.slice(0, selectedMonth).map((m, i) => (
                      <td key={i} className="border border-gray-400 px-2 py-1 text-right">
                        {formatNum(m.total)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
        )}

        {/* 2. MONTHLY INCOME TREND */}
        {(viewCategory === 'All' || viewCategory === 'Graph') && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">MONTHLY INCOME TREND</h2>
            <ExportButtons 
              sectionId="monthly-income-section"
              sectionName="Monthly-Income-Trend"
              excelData={monthlyIncome?.months?.slice(0, selectedMonth).map(m => ({
                Month: m.monthName,
                Income: m.income
              }))}
            />
          </div>
          
          <div id="monthly-income-section" className="bg-white rounded shadow p-4">
            {/* Line Chart */}
            <div className="h-80 mb-4">
              {monthlyIncome && (
                <LineChart
                  labels={monthlyIncome.months?.slice(0, selectedMonth).map((m, i) => `${m.monthName.substring(0, 3).toUpperCase()} ${selectedYear}`)}
                  datasets={[{
                    label: 'Income',
                    data: monthlyIncome.months?.slice(0, selectedMonth).map(m => m.income),
                    borderColor: '#4A90D9',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#4A90D9'
                  }]}
                  height={300}
                  showLegend={false}
                />
              )}
            </div>
            
            {/* Data Table Below Chart */}
            {viewCategory === 'All' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-200 px-2 py-1"></th>
                    {monthlyIncome?.months?.slice(0, selectedMonth).map((m, i) => (
                      <th key={i} className="border border-gray-400 bg-blue-100 px-2 py-1 text-center font-medium text-blue-800">
                        {m.monthName.substring(0, 3).toUpperCase()} {selectedYear}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 font-medium">Income</td>
                    {monthlyIncome?.months?.slice(0, selectedMonth).map((m, i) => (
                      <td key={i} className={`border border-gray-400 px-2 py-1 text-right ${m.income < 0 ? 'text-red-600' : ''}`}>
                        {m.income < 0 ? '- ' : ''}{formatNum(Math.abs(m.income))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
        )}

        {/* 3. MONTH TO MONTH COMPARATIVE */}
        {viewCategory === 'All' && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">MONTH TO MONTH COMPARATIVE</h2>
            <ExportButtons 
              sectionId="month-comparison-section"
              sectionName="Month-to-Month-Comparative"
              excelData={comparisonData?.comparison.map(row => ({
                Service: row.service,
                [salesData.previousMonth]: row.previousMonth,
                [salesData.currentMonth]: row.currentMonth,
                'Income/Less': row.difference,
                '%': `${row.percentChange.toFixed(0)}%`
              }))}
            />
          </div>
          
          <div id="month-comparison-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table */}
            <div className="bg-white rounded shadow p-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-left">SERVICES</th>
                    <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-right">{salesData.previousMonth?.toUpperCase()}</th>
                    <th className="border border-gray-400 bg-blue-900 text-white px-3 py-2 text-right">{salesData.currentMonth?.toUpperCase()}</th>
                    <th className="border border-gray-400 bg-orange-500 text-white px-3 py-2 text-right">INCOME/LESS</th>
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
              </table>
              
              {/* Totals */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>TOTAL REVENUE</span>
                  <div className="flex gap-8">
                    <span>{formatNum(comparisonData?.totals.previousMonth)}</span>
                    <span>{formatNum(comparisonData?.totals.currentMonth)}</span>
                    <span className={comparisonData?.totals.difference < 0 ? 'text-red-600' : ''}>
                      {formatNum(comparisonData?.totals.difference)}
                    </span>
                    <span className={comparisonData?.totals.percentChange < 0 ? 'text-red-600' : ''}>
                      {comparisonData?.totals.percentChange?.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold">
                  <span>TOTAL INCOME</span>
                  <div className="flex gap-8">
                    <span className={comparisonData?.totals.prevIncome < 0 ? 'text-red-600' : ''}>{formatNum(comparisonData?.totals.prevIncome)}</span>
                    <span className={comparisonData?.totals.currIncome < 0 ? 'text-red-600' : ''}>{formatNum(comparisonData?.totals.currIncome)}</span>
                    <span className={comparisonData?.totals.incomeDiff < 0 ? 'text-red-600' : ''}>
                      {formatNum(comparisonData?.totals.incomeDiff)}
                    </span>
                    <span className={comparisonData?.totals.incomePct < 0 ? 'text-red-600' : ''}>
                      {comparisonData?.totals.incomePct?.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded shadow p-4 h-96">
              {comparisonData && (
                <BarChart
                  labels={['REVENUE', 'INCOME']}
                  datasets={[
                    {
                      label: salesData.previousMonth?.toUpperCase(),
                      data: [comparisonData.totals.previousMonth, comparisonData.totals.prevIncome],
                      backgroundColor: '#4A90D9'
                    },
                    {
                      label: salesData.currentMonth?.toUpperCase(),
                      data: [comparisonData.totals.currentMonth, comparisonData.totals.currIncome],
                      backgroundColor: '#F97316'
                    }
                  ]}
                  height={350}
                />
              )}
            </div>
          </div>
        </section>
        )}

        {/* 4. YEAR TO DATE COMPARATIVE - SALES */}
        {(viewCategory === 'All' || viewCategory === 'Graph') && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">YEAR TO DATE COMPARATIVE - SALES</h2>
            <ExportButtons 
              sectionId="ytd-sales-section"
              sectionName="YTD-Sales-Comparative"
              excelData={ytdData.revenueMonths?.map((m, i) => ({
                Month: m.monthName,
                [selectedYear]: m.total,
                [selectedYear - 1]: ytdData.prevRevenueMonths?.[i]?.total || 0
              }))}
            />
          </div>
          
          <div id="ytd-sales-section" className="bg-white rounded shadow p-4">
            {/* Summary Box */}
            <div className="flex justify-end mb-4">
              <table className="text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear - 1}</td>
                    <td className="border border-gray-400 px-4 py-1 text-right">{formatNum(ytdData.previousRevenue)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear}</td>
                    <td className="border border-gray-400 px-4 py-1 text-right">{formatNum(ytdData.currentRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bar Chart */}
            <div className="h-80 mb-4">
              <BarChart
                labels={monthsShort.slice(0, selectedMonth)}
                datasets={[
                  {
                    label: String(selectedYear - 1),
                    data: ytdData.prevRevenueMonths?.map(m => m.total) || [],
                    backgroundColor: '#4A90D9'
                  },
                  {
                    label: String(selectedYear),
                    data: ytdData.revenueMonths?.map(m => m.total) || [],
                    backgroundColor: '#F97316'
                  }
                ]}
                height={300}
              />
            </div>
            
            {/* Data Table */}
            {viewCategory === 'All' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-200 px-2 py-1 text-center">MONTHS</th>
                    {monthsShort.slice(0, selectedMonth).map((m, i) => (
                      <th key={i} className="border border-gray-400 bg-gray-100 px-2 py-1 text-center">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 font-bold text-center">{selectedYear - 1}</td>
                    {ytdData.prevRevenueMonths?.map((m, i) => (
                      <td key={i} className="border border-gray-400 px-2 py-1 text-right">{formatNum(m.total)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 font-bold text-center">{selectedYear}</td>
                    {ytdData.revenueMonths?.map((m, i) => (
                      <td key={i} className="border border-gray-400 px-2 py-1 text-right">{formatNum(m.total)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
        )}

        {/* 5. YEAR TO DATE COMPARATIVE - INCOME */}
        {(viewCategory === 'All' || viewCategory === 'Graph') && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4 border-l-8 border-yellow-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">YEAR TO DATE COMPARATIVE - INCOME</h2>
            <ExportButtons 
              sectionId="ytd-income-section"
              sectionName="YTD-Income-Comparative"
              excelData={ytdData.incomeMonths?.map((m, i) => ({
                Month: m.monthName,
                [selectedYear]: m.income,
                [selectedYear - 1]: ytdData.prevIncomeMonths?.[i]?.income || 0
              }))}
            />
          </div>
          
          <div id="ytd-income-section" className="bg-white rounded shadow p-4">
            {/* Summary Box */}
            <div className="flex justify-end mb-4">
              <table className="text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear - 1}</td>
                    <td className="border border-gray-400 px-4 py-1 text-right">{formatNum(ytdData.previousIncome)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-1 font-bold">{selectedYear}</td>
                    <td className="border border-gray-400 px-4 py-1 text-right">{formatNum(ytdData.currentIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bar Chart */}
            <div className="h-80 mb-4">
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
                height={300}
              />
            </div>
            
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-blue-100 px-2 py-1 text-center">YEAR</th>
                    <th className="border border-gray-400 bg-gray-200 px-2 py-1 text-center" colSpan={selectedMonth}>MONTHS</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 px-2 py-1"></th>
                    {monthsShort.slice(0, selectedMonth).map((m, i) => (
                      <th key={i} className="border border-gray-400 bg-gray-100 px-2 py-1 text-center">{m}</th>
                    ))}
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
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 font-bold text-center">{selectedYear}</td>
                    {ytdData.incomeMonths?.map((m, i) => (
                      <td key={i} className={`border border-gray-400 px-2 py-1 text-right ${m.income < 0 ? 'text-red-600' : ''}`}>
                        {m.income < 0 ? '- ' : ''}{formatNum(Math.abs(m.income))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        )}

        {/* 6. MONTHLY PROJECTION */}
        {viewCategory === 'All' && (
        <section className="bg-gray-100 p-6 print:bg-white print:p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-wide">MONTHLY PROJECTION AS OF {months[selectedMonth - 1].toUpperCase()}</h2>
            <ExportButtons 
              sectionId="monthly-projection-section"
              sectionName="Monthly-Projection"
              excelData={serviceBreakdown?.breakdown?.map(s => ({
                Services: s.departmentName,
                'Avg Monthly': (monthlyRevenue?.yearTotal || 0) / selectedMonth / (serviceBreakdown?.breakdown?.length || 1),
                'Monthly Target': s.revenue * 1.35,
                'Actual': s.revenue
              }))}
            />
          </div>
          
          <div id="monthly-projection-section" className="bg-white rounded shadow p-6 max-w-2xl mx-auto">
            <h3 className="text-center font-bold mb-4 border-b pb-2">
              MONTHLY PROJECTION as of {months[selectedMonth - 1].toUpperCase()} {selectedYear}
            </h3>
            
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="font-bold">
                  <th className="border border-gray-400 px-3 py-2 text-left">SERVICES</th>
                  <th className="border border-gray-400 px-3 py-2 text-right">AVG MONTHLY</th>
                  <th className="border border-gray-400 px-3 py-2 text-right">MONTHLY</th>
                  <th className="border border-gray-400 px-3 py-2 text-right">ACTUAL</th>
                </tr>
              </thead>
              <tbody>
                {serviceBreakdown?.breakdown?.map((s, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-400 px-3 py-1 italic">{s.departmentName}</td>
                    <td className="border border-gray-400 px-3 py-1 text-right">
                      {formatNum((monthlyRevenue?.yearTotal || 0) / selectedMonth / (serviceBreakdown?.breakdown?.length || 1))}
                    </td>
                    <td className="border border-gray-400 px-3 py-1 text-right">{formatNum(s.revenue * 1.35)}</td>
                    <td className="border border-gray-400 px-3 py-1 text-right">{formatNum(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="border border-gray-400 px-3 py-2 text-center">TOTAL</td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    {formatNum((monthlyRevenue?.yearTotal || 0) / selectedMonth)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    {formatNum((serviceBreakdown?.totalRevenue || 0) * 1.35)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    {formatNum(serviceBreakdown?.totalRevenue || 0)}
                  </td>
                </tr>
                <tr className="font-bold border-t-2">
                  <td className="border border-gray-400 px-3 py-2 text-center">%</td>
                  <td className="border border-gray-400 px-3 py-2 text-right"></td>
                  <td className="border border-gray-400 px-3 py-2 text-right">35%</td>
                  <td className="border border-gray-400 px-3 py-2 text-right"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
        )}

        {/* 7. MONTH END REPORT */}
        {viewCategory === 'All' && (
        <section className="p-6 print:p-4" style={{ background: 'linear-gradient(to right, #1e3a5f 0%, #1e3a5f 30px, #f3f4f6 30px)' }}>
          <div className="pl-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-wide italic">MONTH END REPORT</h2>
              <ExportButtons 
                sectionId="month-end-section"
                sectionName="Month-End-Report"
                excelData={serviceBreakdown?.breakdown?.map(s => ({
                  Service: s.departmentName,
                  Revenue: s.revenue,
                  Percentage: `${s.percentage}%`
                }))}
              />
            </div>
            
            <div id="month-end-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Table */}
              <div className="bg-white rounded shadow p-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="border border-gray-400 px-3 py-2 text-left">SERVICES</th>
                      <th className="border border-gray-400 px-3 py-2 text-right">REVENUE</th>
                      <th className="border border-gray-400 px-3 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBreakdown?.breakdown?.map((s, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border border-gray-400 px-3 py-1">{s.departmentName}</td>
                        <td className="border border-gray-400 px-3 py-1 text-right">{formatNum(s.revenue)}</td>
                        <td className="border border-gray-400 px-3 py-1 text-right">{s.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-gray-100">
                      <td className="border border-gray-400 px-3 py-2">TOTAL</td>
                      <td className="border border-gray-400 px-3 py-2 text-right">{formatNum(serviceBreakdown?.totalRevenue || 0)}</td>
                      <td className="border border-gray-400 px-3 py-2 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded shadow p-4 h-96">
                {serviceBreakdown && (
                  <DoughnutChart
                    labels={serviceBreakdown.breakdown?.map(s => s.departmentName)}
                    data={serviceBreakdown.breakdown?.map(s => s.revenue)}
                    height={350}
                    cutout="0%"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Footer - Print only */}
        <div className="hidden print:block text-center text-sm text-gray-500 mt-8 pt-4 border-t">
          <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;