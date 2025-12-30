import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { departmentService } from '../../services/departmentService';
import salesService from '../../services/salesService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { CHART_COLORS, CHART_PALETTE, MONTHS } from '../../utils/constants';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';
import ComparativeChart from '../../components/charts/ComparativeChart';

const DashboardSummaryReport = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  
  // Data states
  const [departments, setDepartments] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [prevYearRevenueData, setPrevYearRevenueData] = useState(null);
  const [prevYearIncomeData, setPrevYearIncomeData] = useState(null);
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  const [ytdServiceBreakdown, setYtdServiceBreakdown] = useState(null);
  const [monthToMonth, setMonthToMonth] = useState(null);
  const [ytdSales, setYtdSales] = useState(null);
  const [ytdIncome, setYtdIncome] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [prevYearSalesData, setPrevYearSalesData] = useState([]);
  
  // Print mode
  const [printMode, setPrintMode] = useState(false);
  
  // Comparison toggle state
  const [showPreviousMonth, setShowPreviousMonth] = useState(true);
  const [showCurrentMonth, setShowCurrentMonth] = useState(true);

  const years = useMemo(() => {
    const result = [];
    const cy = new Date().getFullYear();
    for (let y = cy - 4; y <= cy + 1; y++) result.push(y);
    return result;
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAll();
        const deptData = response.data;
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        } else if (deptData && Array.isArray(deptData.departments)) {
          setDepartments(deptData.departments);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch main data based on filters
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentMonth = selectedMonth === 'all' ? new Date().getMonth() + 1 : parseInt(selectedMonth);
      const prevYear = selectedYear - 1;
      
      const [revenueResp, incomeResp, prevYearRevenueResp, prevYearIncomeResp, breakdownResp, ytdBreakdownResp, baseResp, salesResp, prevYearSalesResp] = await Promise.all([
        dashboardService.getYearlyRevenue(selectedYear),
        dashboardService.getYearlyIncome(selectedYear),
        dashboardService.getYearlyRevenue(prevYear),
        dashboardService.getYearlyIncome(prevYear),
        dashboardService.getServiceBreakdown(selectedYear, currentMonth),
        dashboardService.getYearlyServiceBreakdown(selectedYear), // YTD yearly breakdown
        dashboardService.getMainDashboard(),
        salesService.getAll({ year: selectedYear, limit: 10000 }),
        salesService.getAll({ year: prevYear, limit: 10000 })
      ]);
      
      setRevenueData(revenueResp.data);
      setIncomeData(incomeResp.data);
      setPrevYearRevenueData(prevYearRevenueResp.data);
      setPrevYearIncomeData(prevYearIncomeResp.data);
      setServiceBreakdown(breakdownResp.data);

      // Transform yearly breakdown (months + departments) into { breakdown: [{ departmentName, revenue }, ...] }
      let ytdPayload = ytdBreakdownResp.data;
      if (ytdPayload && Array.isArray(ytdPayload.months) && Array.isArray(ytdPayload.departments)) {
        const totals = {};
        // initialize
        ytdPayload.departments.forEach(name => { totals[name] = 0; });
        // sum across months
        ytdPayload.months.forEach(m => {
          const services = m.services || {};
          Object.entries(services).forEach(([name, amount]) => {
            totals[name] = (totals[name] || 0) + (Number(amount) || 0);
          });
        });
        const breakdown = Object.keys(totals).map(name => ({ departmentName: name, revenue: totals[name] })).filter(b => b.revenue > 0);
        ytdPayload = { ...ytdPayload, breakdown };
      }

      setYtdServiceBreakdown(ytdPayload);
      setMonthToMonth(baseResp.data?.monthToMonth || null);
      setYtdSales(baseResp.data?.ytdSales || null);
      setYtdIncome(baseResp.data?.ytdIncome || null);
      setSalesData(salesResp.data?.sales || []);
      setPrevYearSalesData(prevYearSalesResp.data?.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter sales data by service and calculate monthly aggregation
  const monthlySalesByService = useMemo(() => {
    if (!salesData.length || !departments.length) return null;

    const serviceMap = {};
    const filterMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) : null;
    
    // Initialize all departments
    departments.forEach(dept => {
      serviceMap[dept.id] = {
        departmentId: dept.id,
        departmentName: dept.name,
        months: Array(12).fill(0)
      };
    });

    // Aggregate sales by service and month
    salesData.forEach(sale => {
      const dateStr = sale.date;
      let saleYear, saleMonth;
      
      if (typeof dateStr === 'string') {
        const datePart = dateStr.split('T')[0];
        const parts = datePart.split('-');
        saleYear = parseInt(parts[0], 10);
        saleMonth = parseInt(parts[1], 10);
      } else {
        const saleDate = new Date(dateStr);
        saleMonth = saleDate.getMonth() + 1;
        saleYear = saleDate.getFullYear();
      }

      if (saleYear !== selectedYear) return;
      
      // Filter by month if selected
      if (filterMonth && saleMonth !== filterMonth) return;

      // Filter by service if selected
      const deptId = sale.department?.id || sale.departmentId;
      if (selectedService !== 'all' && deptId !== parseInt(selectedService)) return;

      if (serviceMap[deptId]) {
        serviceMap[deptId].months[saleMonth - 1] += parseFloat(sale.amount || 0);
      }
    });

    // Convert to array and filter out services with no sales
    const servicesArray = Object.values(serviceMap).filter(s => 
      s.months.some(m => m > 0)
    );

    return servicesArray;
  }, [salesData, departments, selectedYear, selectedService, selectedMonth]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    if (!revenueData || !incomeData) return null;

    let revenueMonths = [...(revenueData.months || [])];
    let incomeMonths = [...(incomeData.months || [])];
    let breakdown = serviceBreakdown?.breakdown || [];

    // Filter by month if not 'all'
    if (selectedMonth !== 'all') {
      const monthNum = parseInt(selectedMonth);
      revenueMonths = revenueMonths.filter((_, idx) => idx + 1 === monthNum);
      incomeMonths = incomeMonths.filter((_, idx) => idx + 1 === monthNum);
    }

    // Filter by service if not 'all' - recalculate from sales data
    if (selectedService !== 'all') {
      const deptId = parseInt(selectedService);
      breakdown = breakdown.filter(b => b.departmentId === deptId);
      
      // Recalculate revenue and income based on filtered service
      const filteredSales = salesData.filter(s => {
        const dateStr = s.date;
        let saleYear, saleMonth;
        
        if (typeof dateStr === 'string') {
          const datePart = dateStr.split('T')[0];
          const parts = datePart.split('-');
          saleYear = parseInt(parts[0], 10);
          saleMonth = parseInt(parts[1], 10);
        } else {
          const saleDate = new Date(dateStr);
          saleMonth = saleDate.getMonth() + 1;
          saleYear = saleDate.getFullYear();
        }

        const saleDeptId = s.department?.id || s.departmentId;
        return saleYear === selectedYear && saleDeptId === deptId;
      });

      // Recalculate monthly revenue for the selected service
      revenueMonths = revenueMonths.map((m, idx) => {
        const monthRevenue = filteredSales
          .filter(s => {
            const dateStr = s.date;
            let saleMonth;
            if (typeof dateStr === 'string') {
              const datePart = dateStr.split('T')[0];
              saleMonth = parseInt(datePart.split('-')[1], 10);
            } else {
              saleMonth = new Date(dateStr).getMonth() + 1;
            }
            return saleMonth === idx + 1;
          })
          .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
        
        return {
          ...m,
          total: monthRevenue
        };
      });
    }

    // Calculate totals
    const totalRevenue = revenueMonths.reduce((sum, m) => sum + (m.total || 0), 0);
    // When filtering by service, expenses are not service-specific, so calculate income as revenue only
    const totalExpenses = selectedService !== 'all' ? 0 : incomeMonths.reduce((sum, m) => sum + (m.expenses || 0), 0);
    const totalIncome = selectedService !== 'all' ? totalRevenue : incomeMonths.reduce((sum, m) => sum + (m.income || 0), 0);

    // Previous year totals
    const prevYearRevMonths = prevYearRevenueData?.months || [];
    const prevYearIncMonths = prevYearIncomeData?.months || [];
    const prevYearTotalRevenue = prevYearRevMonths.reduce((sum, m) => sum + (m.total || 0), 0);
    const prevYearTotalIncome = prevYearIncMonths.reduce((sum, m) => sum + (m.income || 0), 0);

    // Service breakdown totals
    const breakdownTotal = breakdown.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const breakdownWithPercentage = breakdown.map(b => ({
      ...b,
      percentage: breakdownTotal > 0 ? ((b.revenue / breakdownTotal) * 100).toFixed(1) : 0
    }));

    // YTD Service breakdown (full year)
    const ytdBreakdown = ytdServiceBreakdown?.breakdown || [];
    const ytdBreakdownTotal = ytdBreakdown.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const ytdBreakdownWithPercentage = ytdBreakdown.map(b => ({
      ...b,
      percentage: ytdBreakdownTotal > 0 ? ((b.revenue / ytdBreakdownTotal) * 100).toFixed(1) : 0
    }));

    // Calculate current month revenue for display
    const currentMonthIdx = selectedMonth === 'all' ? new Date().getMonth() : parseInt(selectedMonth) - 1;
    // When month is filtered, revenueMonths array only contains filtered months, so use index 0 or the last available
    const currentMonthRevenue = selectedMonth !== 'all' 
      ? (revenueMonths[0]?.total || 0) 
      : (revenueMonths[currentMonthIdx]?.total || 0);
    const currentMonthIncome = selectedService !== 'all' 
      ? currentMonthRevenue 
      : (selectedMonth !== 'all' ? (incomeMonths[0]?.income || 0) : (incomeMonths[currentMonthIdx]?.income || 0));
    
    // Calculate previous year same month values for variance (PY - CY)
    const prevYearSameMonthRevenue = prevYearRevMonths[currentMonthIdx]?.total || 0;
    const prevYearSameMonthIncome = prevYearIncMonths[currentMonthIdx]?.income || 0;

    // YTD Revenue Variance = CY - PY (Current Year minus Previous Year)
    const ytdRevenueVariance = totalRevenue - prevYearTotalRevenue;
    // YTD Income Variance = CY - PY (Current Year minus Previous Year)
    const ytdIncomeVariance = totalIncome - prevYearTotalIncome;
    // Month to Month Revenue Variance = CY current month - PY same month
    const monthRevenueVariance = currentMonthRevenue - prevYearSameMonthRevenue;
    // Month to Month Income Variance = CY current month - PY same month
    const monthIncomeVariance = currentMonthIncome - prevYearSameMonthIncome;

    // Month change percentage for revenue
    let monthRevenueChange = 0;
    if (prevYearSameMonthRevenue > 0) {
      monthRevenueChange = ((currentMonthRevenue - prevYearSameMonthRevenue) / prevYearSameMonthRevenue) * 100;
    }
    
    // Month change percentage for income
    let monthIncomeChange = 0;
    if (prevYearSameMonthIncome > 0) {
      monthIncomeChange = ((currentMonthIncome - prevYearSameMonthIncome) / prevYearSameMonthIncome) * 100;
    }

    // Month change percentage - only if we have at least 2 months
    let monthChange = 0;
    if (revenueMonths.length >= 2) {
      const lastMonth = revenueMonths[revenueMonths.length - 1]?.total || 0;
      const prevMonth = revenueMonths[revenueMonths.length - 2]?.total || 0;
      if (prevMonth > 0) {
        monthChange = ((lastMonth - prevMonth) / prevMonth) * 100;
      }
    }

    return {
      revenueMonths,
      incomeMonths,
      breakdown: breakdownWithPercentage,
      ytdBreakdown: ytdBreakdownWithPercentage,
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        income: totalIncome,
        currentMonthRevenue,
        currentMonthIncome,
        prevYearTotalRevenue,
        prevYearTotalIncome,
        prevYearSameMonthRevenue,
        prevYearSameMonthIncome,
        ytdRevenueVariance,
        ytdIncomeVariance,
        monthRevenueVariance,
        monthIncomeVariance,
        monthRevenueChange,
        monthIncomeChange,
        monthChange,
        profitMargin: totalRevenue > 0 ? ((totalIncome / totalRevenue) * 100).toFixed(1) : 0
      }
    };
  }, [revenueData, incomeData, prevYearRevenueData, prevYearIncomeData, serviceBreakdown, ytdServiceBreakdown, selectedMonth, selectedService, salesData, selectedYear]);

  // Daily comparison data
  const dailyComparisonData = useMemo(() => {
    if (!salesData.length) return null;

    const currentMonth = selectedMonth === 'all' ? new Date().getMonth() + 1 : parseInt(selectedMonth);
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? selectedYear - 1 : selectedYear;

    const daysInCurrentMonth = new Date(selectedYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const maxDays = Math.max(daysInCurrentMonth, daysInPrevMonth);

    const currentMonthData = Array(daysInCurrentMonth).fill(0);
    const prevMonthData = Array(daysInPrevMonth).fill(0);

    salesData.forEach(sale => {
      const dateStr = sale.date;
      let saleYear, saleMonth, saleDay;
      
      if (typeof dateStr === 'string') {
        const datePart = dateStr.split('T')[0];
        const parts = datePart.split('-');
        saleYear = parseInt(parts[0], 10);
        saleMonth = parseInt(parts[1], 10);
        saleDay = parseInt(parts[2], 10);
      } else {
        const saleDate = new Date(dateStr);
        saleMonth = saleDate.getMonth() + 1;
        saleYear = saleDate.getFullYear();
        saleDay = saleDate.getDate();
      }

      // Filter by service if needed
      if (selectedService !== 'all') {
        const deptId = parseInt(selectedService);
        const saleDeptId = sale.department?.id || sale.departmentId;
        if (saleDeptId !== deptId) return;
      }

      if (saleYear === selectedYear && saleMonth === currentMonth) {
        currentMonthData[saleDay - 1] += parseFloat(sale.amount || 0);
      } else if (saleYear === prevYear && saleMonth === prevMonth) {
        prevMonthData[saleDay - 1] += parseFloat(sale.amount || 0);
      }
    });

    const labels = Array.from({ length: maxDays }, (_, i) => (i + 1).toString());
    const paddedPrevMonth = [...prevMonthData];
    while (paddedPrevMonth.length < maxDays) {
      paddedPrevMonth.push(null);
    }

    const currentMonthName = new Date(selectedYear, currentMonth - 1).toLocaleString('en-US', { month: 'short' });
    const prevMonthName = new Date(prevYear, prevMonth - 1).toLocaleString('en-US', { month: 'short' });

    return {
      labels,
      currentMonthName,
      prevMonthName,
      currentMonthData,
      prevMonthData: paddedPrevMonth,
      currentTotal: currentMonthData.reduce((a, b) => a + b, 0),
      prevTotal: prevMonthData.reduce((a, b) => a + b, 0)
    };
  }, [salesData, selectedMonth, selectedYear, selectedService]);

  // Month to Month Comparison
  const monthToMonthData = useMemo(() => {
    if (!monthlySalesByService || monthlySalesByService.length === 0) return null;

    const currentMonth = selectedMonth === 'all' ? new Date().getMonth() : parseInt(selectedMonth) - 1;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const comparison = monthlySalesByService.map(service => ({
      departmentName: service.departmentName,
      currentMonth: service.months[currentMonth] || 0,
      previousMonth: service.months[prevMonth] || 0,
      difference: (service.months[currentMonth] || 0) - (service.months[prevMonth] || 0),
      percentChange: service.months[prevMonth] > 0 
        ? (((service.months[currentMonth] || 0) - (service.months[prevMonth] || 0)) / service.months[prevMonth] * 100)
        : 0
    }));

    return comparison.filter(c => c.currentMonth > 0 || c.previousMonth > 0);
  }, [monthlySalesByService, selectedMonth]);

  // YTD Comparison
  const ytdComparison = useMemo(() => {
    if (!revenueData || !incomeData) return null;

    const currentYearMonths = revenueData.months || [];
    const currentYearIncomeMonths = incomeData.months || [];
    const filterMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) : null;

    // Filter by month if selected - show only up to selected month
    let salesMonths = currentYearMonths;
    let incomeMonths = currentYearIncomeMonths;
    
    if (filterMonth) {
      salesMonths = currentYearMonths.filter((_, idx) => idx + 1 <= filterMonth);
      incomeMonths = currentYearIncomeMonths.filter((_, idx) => idx + 1 <= filterMonth);
    }

    // If service filter is applied, recalculate from filtered sales data
    let salesComparison = [];
    if (selectedService !== 'all') {
      const deptId = parseInt(selectedService);
      salesComparison = salesMonths.map((m, idx) => {
        const monthNum = idx + 1;
        const monthSales = salesData
          .filter(s => {
            const dateStr = s.date;
            let saleYear, saleMonth;
            if (typeof dateStr === 'string') {
              const datePart = dateStr.split('T')[0];
              const parts = datePart.split('-');
              saleYear = parseInt(parts[0], 10);
              saleMonth = parseInt(parts[1], 10);
            } else {
              const saleDate = new Date(dateStr);
              saleMonth = saleDate.getMonth() + 1;
              saleYear = saleDate.getFullYear();
            }
            const saleDeptId = s.department?.id || s.departmentId;
            return saleYear === selectedYear && saleMonth === monthNum && saleDeptId === deptId;
          })
          .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
        
        return {
          monthName: m.monthName,
          currentYear: monthSales,
          previousYear: 0,
          variance: monthSales
        };
      });
    } else {
      salesComparison = salesMonths.map((m, idx) => ({
        monthName: m.monthName,
        currentYear: m.total || 0,
        previousYear: 0, // Would need previous year data
        variance: m.total || 0
      }));
    }

    // If service filter is applied, recalculate income from filtered revenue and expenses
    let incomeComparison = [];
    if (selectedService !== 'all') {
      // When filtering by service, calculate income as revenue minus proportional expenses
      // Since expenses aren't service-specific, we'll show service revenue only
      incomeComparison = salesComparison.map((s, idx) => ({
        monthName: s.monthName,
        currentYear: s.currentYear, // Show revenue as income proxy for filtered service
        previousYear: 0,
        variance: s.currentYear
      }));
    } else {
      incomeComparison = incomeMonths.map((m, idx) => ({
        monthName: m.monthName,
        currentYear: m.income || 0,
        previousYear: 0, // Would need previous year data
        variance: m.income || 0
      }));
    }

    return {
      sales: salesComparison,
      income: incomeComparison
    };
  }, [revenueData, incomeData, selectedMonth, selectedService, salesData, selectedYear]);

  // Top services by revenue
  const topServices = useMemo(() => {
    if (!filteredData?.breakdown) return [];
    return [...filteredData.breakdown]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [filteredData]);

  // Export handlers
  const handleExport = async (format) => {
    setExporting(true);
    const filename = `Dashboard-Summary-${selectedYear}${selectedMonth !== 'all' ? `-${MONTHS[parseInt(selectedMonth) - 1]?.short}` : ''}`;
    
    try {
      setPrintMode(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (format === 'png') {
        await exportToPNG('dashboard-summary-content', filename);
      } else if (format === 'pdf') {
        await exportToPDF('dashboard-summary-content', filename, 'Executive Dashboard Summary');
      } else if (format === 'excel') {
        const excelData = [];
        
        excelData.push({ Section: 'Summary', Metric: 'Total Revenue', Value: filteredData?.totals.revenue || 0 });
        excelData.push({ Section: 'Summary', Metric: 'Total Expenses', Value: filteredData?.totals.expenses || 0 });
        excelData.push({ Section: 'Summary', Metric: 'Net Income', Value: filteredData?.totals.income || 0 });
        excelData.push({ Section: 'Summary', Metric: 'Profit Margin', Value: `${filteredData?.totals.profitMargin}%` });
        
        filteredData?.revenueMonths?.forEach(m => {
          excelData.push({ Section: 'Monthly Revenue', Metric: m.monthName, Value: m.total || 0 });
        });
        
        filteredData?.breakdown?.forEach(b => {
          excelData.push({ Section: 'Service Breakdown', Metric: b.departmentName, Value: b.revenue || 0 });
        });
        
        exportToExcel(excelData, filename);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setPrintMode(false);
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth('all');
    setSelectedService('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${printMode ? 'print-mode' : ''}`}>
      {/* Header Bar */}
      <div className={`bg-white shadow-sm border-b sticky top-0 z-50 ${printMode ? 'hidden' : ''}`}>
        <div className="max-w-full mx-auto px-4">
          <div className="py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-lg font-bold text-gray-800">Executive Dashboard</h1>
            </div>

            {/* Center: Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Months</option>
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>

              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Services</option>
                {Array.isArray(departments) && departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <button onClick={resetFilters} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Reset">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Right: Export */}
            <div className="flex items-center gap-2">
              <button onClick={() => handleExport('png')} disabled={exporting} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                PNG
              </button>
              <button onClick={() => handleExport('pdf')} disabled={exporting} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
              <button onClick={() => handleExport('excel')} disabled={exporting} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div id="dashboard-summary-content" ref={dashboardRef} className="p-4" style={{ backgroundColor: '#f8fafc' }}>
        
        {/* Print Header */}
        {printMode && (
          <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
            <h1 className="text-xl font-bold text-gray-800">Executive Dashboard Summary</h1>
            <p className="text-gray-600 text-sm">
              {selectedYear} {selectedMonth !== 'all' ? `- ${MONTHS[parseInt(selectedMonth) - 1]?.label}` : ''} 
              {selectedService !== 'all' && Array.isArray(departments) ? ` - ${departments.find(d => d.id === parseInt(selectedService))?.name || ''}` : ''}
            </p>
            <p className="text-xs text-gray-500">Generated: {new Date().toLocaleString()}</p>
          </div>
        )}

        {/* Row 1: KPI Cards - 4 columns */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {/* YTD Revenue */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg p-4 text-white shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">YTD Revenue</p>
                <p className="text-xs text-white/60 mt-0.5">Year Total Revenue</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(filteredData?.totals.revenue || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* YTD Income */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg p-4 text-white shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">YTD Income</p>
                <p className="text-xs text-white/60 mt-0.5">Year Total Income</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(filteredData?.totals.income || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Current Month Revenue */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 text-white shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Current Month Revenue</p>
                <p className="text-xs text-white/60 mt-0.5">Current Month</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(filteredData?.totals.currentMonthRevenue || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Current Month Income */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg p-4 text-white shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Current Month Income</p>
                <p className="text-xs text-white/60 mt-0.5">Month Change</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(filteredData?.totals.currentMonthIncome || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Variance Cards - 4 columns (PY - CY) */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {/* YTD Revenue Variance (PY - CY) */}
          <div className={`bg-gradient-to-r ${(filteredData?.totals.ytdRevenueVariance || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-lg p-4 text-white shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">YTD Revenue Variance</p>
                <p className="text-xs text-white/60 mt-0.5">PY ({selectedYear - 1}) - CY ({selectedYear})</p>
                <p className="text-xl font-bold mt-1">{(filteredData?.totals.ytdRevenueVariance || 0) >= 0 ? '+' : ''}{formatCurrency(filteredData?.totals.ytdRevenueVariance || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {(filteredData?.totals.ytdRevenueVariance || 0) >= 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* YTD Income Variance (PY - CY) */}
          <div className={`bg-gradient-to-r ${(filteredData?.totals.ytdIncomeVariance || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-lg p-4 text-white shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">YTD Income Variance</p>
                <p className="text-xs text-white/60 mt-0.5">PY ({selectedYear - 1}) - CY ({selectedYear})</p>
                <p className="text-xl font-bold mt-1">{(filteredData?.totals.ytdIncomeVariance || 0) >= 0 ? '+' : ''}{formatCurrency(filteredData?.totals.ytdIncomeVariance || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {(filteredData?.totals.ytdIncomeVariance || 0) >= 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Month to Month Revenue Variance (PY same month - CY current month) */}
          <div className={`bg-gradient-to-r ${(filteredData?.totals.monthRevenueVariance || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-lg p-4 text-white shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Month to Month Revenue Variance</p>
                <p className="text-xs text-white/60 mt-0.5">PY ({selectedYear - 1}) - CY ({selectedYear})</p>
                <p className="text-xl font-bold mt-1">{(filteredData?.totals.monthRevenueVariance || 0) >= 0 ? '+' : ''}{formatCurrency(filteredData?.totals.monthRevenueVariance || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {(filteredData?.totals.monthRevenueVariance || 0) >= 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Month to Month Income Variance (PY same month - CY current month) */}
          <div className={`bg-gradient-to-r ${(filteredData?.totals.monthIncomeVariance || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-lg p-4 text-white shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wide">Month to Month Income Variance</p>
                <p className="text-xs text-white/60 mt-0.5">PY ({selectedYear - 1}) - CY ({selectedYear})</p>
                <p className="text-xl font-bold mt-1">{(filteredData?.totals.monthIncomeVariance || 0) >= 0 ? '+' : ''}{formatCurrency(filteredData?.totals.monthIncomeVariance || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {(filteredData?.totals.monthIncomeVariance || 0) >= 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Total Daily Sales for the Month - Full Width (Current Month Only) */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Total Daily Sales for the Month</h3>
              <p className="text-xs text-gray-500">{MONTHS[selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : new Date().getMonth()]?.label} {selectedYear}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                Total: {formatCurrency(dailyComparisonData?.currentMonthData?.reduce((sum, v) => sum + (v || 0), 0) || 0)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                {dailyComparisonData?.currentMonthName} {selectedYear}
              </span>
            </div>
          </div>
          <div style={{ height: '180px' }}>
            {dailyComparisonData ? (
              <LineChart
                labels={dailyComparisonData.labels}
                datasets={[
                  {
                    label: `${dailyComparisonData.currentMonthName} ${selectedYear}`,
                    data: dailyComparisonData.currentMonthData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                  }
                ]}
                height={180}
                showLegend={false}
                showValues={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Row 4: Total Daily Sales Comparison - Full Width */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Total Daily Sales Comparison</h3>
              <p className="text-xs text-gray-500">{MONTHS[selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : new Date().getMonth()]?.label} {selectedYear} vs Previous Month</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                Current: {formatCurrency(dailyComparisonData?.currentMonthData?.reduce((sum, v) => sum + (v || 0), 0) || 0)}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium">
                Previous: {formatCurrency(dailyComparisonData?.prevMonthData?.reduce((sum, v) => sum + (v || 0), 0) || 0)}
              </span>
              <button 
                onClick={() => setShowCurrentMonth(!showCurrentMonth)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showCurrentMonth ? 'bg-blue-100' : 'bg-gray-100 opacity-50'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showCurrentMonth ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                {dailyComparisonData?.currentMonthName} {selectedYear}
              </button>
              <button 
                onClick={() => setShowPreviousMonth(!showPreviousMonth)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showPreviousMonth ? 'bg-red-100' : 'bg-gray-100 opacity-50'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showPreviousMonth ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                {dailyComparisonData?.prevMonthName} {dailyComparisonData?.prevMonthName === 'Dec' ? selectedYear - 1 : selectedYear}
              </button>
            </div>
          </div>
          <div style={{ height: '160px' }}>
            {dailyComparisonData ? (
              <LineChart
                labels={dailyComparisonData.labels}
                datasets={[
                  ...(showCurrentMonth ? [{
                    label: `${dailyComparisonData.currentMonthName} ${selectedYear}`,
                    data: dailyComparisonData.currentMonthData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    borderWidth: 2
                  }] : []),
                  ...(showPreviousMonth ? [{
                    label: dailyComparisonData.prevMonthName,
                    data: dailyComparisonData.prevMonthData,
                    borderColor: '#ef4444',   
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    borderWidth: 2
                  }] : [])
                ]}
                height={160}
                showLegend={false}
                showValues={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Row 5: Current Month Sales Per Service (large), Month-to-Month Comparison, Current Month Breakdown */}
        <div className="grid grid-cols-12 gap-3 mb-4">
          {/* Current Month Sales Per Service - Bar Chart (Larger) */}
          <div className="col-span-3 bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Current Month Sales Per Service</h3>
            </div>
            <p className="text-xs text-gray-500 mb-1">{MONTHS[selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : new Date().getMonth()]?.label} {selectedYear}</p>
            <div className="text-right mb-1">
              <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded font-medium">
                Total: {formatCurrency(monthlySalesByService?.slice(0, 8).reduce((sum, s) => {
                  const currentMonthIdx = selectedMonth === 'all' ? new Date().getMonth() : parseInt(selectedMonth) - 1;
                  return sum + (s.months[currentMonthIdx] || 0);
                }, 0) || 0)}
              </span>
            </div>
            <div style={{ height: '260px' }}>
              {monthlySalesByService && monthlySalesByService.length > 0 ? (
                <BarChart
                  labels={monthlySalesByService.slice(0, 8).map(s => s.departmentName?.substring(0, 15) || '')}
                  datasets={[
                    {
                      label: 'Sales',
                      data: monthlySalesByService.slice(0, 8).map(s => {
                        const currentMonthIdx = selectedMonth === 'all' ? new Date().getMonth() : parseInt(selectedMonth) - 1;
                        return s.months[currentMonthIdx] || 0;
                      }),
                      backgroundColor: ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316']
                    }
                  ]}
                  height={260}
                  showLegend={false}
                  horizontal={true}
                  showValues={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Month-to-Month Comparison */}
          <div className="col-span-6 bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Month-to-Month Comparison</h3>
                <p className="text-xs text-gray-500">{selectedYear}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">
                  Current Total: {formatCurrency(monthToMonthData?.reduce((sum, m) => sum + (m.currentMonth || 0), 0) || 0)}
                </span>
                <button className="text-xs text-blue-600 hover:underline">⤢ Export</button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs mb-2">
              <button 
                onClick={() => setShowPreviousMonth(!showPreviousMonth)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showPreviousMonth ? 'bg-indigo-100' : 'bg-gray-100 opacity-50'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showPreviousMonth ? 'bg-indigo-400' : 'bg-gray-400'}`}></span>
                Previous Month
              </button>
              <button 
                onClick={() => setShowCurrentMonth(!showCurrentMonth)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showCurrentMonth ? 'bg-indigo-100' : 'bg-gray-100 opacity-50'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showCurrentMonth ? 'bg-indigo-600' : 'bg-gray-400'}`}></span>
                Current Month
              </button>
            </div>
            <div style={{ height: '220px' }}>
              {monthToMonthData && monthToMonthData.length > 0 ? (
                <BarChart
                  labels={monthToMonthData.slice(0, 6).map(m => m.departmentName?.substring(0, 15) || '')}
                  datasets={[
                    ...(showPreviousMonth ? [{
                      label: 'Previous',
                      data: monthToMonthData.slice(0, 6).map(m => m.previousMonth),
                      backgroundColor: '#a5b4fc'
                    }] : []),
                    ...(showCurrentMonth ? [{
                      label: 'Current',
                      data: monthToMonthData.slice(0, 6).map(m => m.currentMonth),
                      backgroundColor: '#6366f1'
                    }] : [])
                  ]}
                  height={220}
                  showLegend={false}
                  showValues={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Current Month Sales Breakdown - Doughnut */}
          <div className="col-span-3 bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Current Month Sales Breakdown</h3>
              {/* <button className="text-xs text-blue-600 hover:underline">⤢ Export</button> */}
            </div>
            <p className="text-xs text-gray-500 mb-1">{MONTHS[selectedMonth !== 'all' ? parseInt(selectedMonth) - 1 : new Date().getMonth()]?.label} {selectedYear}</p>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-400">Service Breakdown</span>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                Total: {formatCurrency(filteredData?.breakdown?.reduce((sum, b) => sum + (b.revenue || 0), 0) || 0)}
              </span>
            </div>
            <div style={{ height: '230px' }}>
              {filteredData?.breakdown?.length > 0 ? (
                <DoughnutChart
                  labels={filteredData.breakdown.slice(0, 6).map(b => b.departmentName || '')}
                  data={filteredData.breakdown.slice(0, 6).map(b => b.revenue || 0)}
                  height={230}
                  showLegend={true}
                  showPercentage={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Row 6: Revenue Trend and YTD Sales Breakdown */}
        <div className="grid grid-cols-12 gap-3 mb-4">
          {/* Revenue Trend */}
          <div className="col-span-9 bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Revenue Trend</h3>
                <p className="text-xs text-gray-500">{selectedYear}</p>
              </div>
              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded font-medium">
                Total YTD: {formatCurrency(filteredData?.totals?.revenue || 0)}
              </span>
            </div>
            <div style={{ height: '200px' }}>
              {filteredData?.revenueMonths?.length > 0 ? (
                <LineChart
                  labels={MONTHS.map(m => m.short)}
                  datasets={[{
                    label: 'Revenue',
                    data: filteredData.revenueMonths.map(m => m.total || 0),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                  }]}
                  height={200}
                  showLegend={false}
                  showValues={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* YTD Sales Breakdown - Doughnut */}
          <div className="col-span-3 bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">YTD Sales Breakdown</h3>
              {/* <button className="text-xs text-blue-600 hover:underline">⤢ Export</button> */}
            </div>
            <p className="text-xs text-gray-500 mb-1">Full Year {selectedYear}</p>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-400">Service Breakdown</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                Total: {formatCurrency(filteredData?.ytdBreakdown?.reduce((sum, b) => sum + (b.revenue || 0), 0) || filteredData?.totals?.revenue || 0)}
              </span>
            </div>
            <div style={{ height: '200px' }}>
              {(filteredData?.ytdBreakdown?.length > 0 || filteredData?.breakdown?.length > 0) ? (
                <DoughnutChart
                  labels={(filteredData?.ytdBreakdown?.length > 0 ? filteredData.ytdBreakdown : filteredData.breakdown).map(b => b.departmentName || '')}
                  data={(filteredData?.ytdBreakdown?.length > 0 ? filteredData.ytdBreakdown : filteredData.breakdown).map(b => b.revenue || 0)}
                  height={200}
                  showLegend={true}
                  showPercentage={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Row 7: Month to Month Income Comparative */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Month to Month Income Comparative</h3>
              <p className="text-xs text-gray-500">{selectedYear}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">
                Current Total: {formatCurrency(monthToMonthData?.reduce((sum, m) => sum + (m.currentMonth || 0), 0) || 0)}
              </span>
              <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium">
                Previous Total: {formatCurrency(monthToMonthData?.reduce((sum, m) => sum + (m.previousMonth || 0), 0) || 0)}
              </span>
              <button className="text-xs text-blue-600 hover:underline">⤢ Export</button>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Month-to-Month Comparison</h4>
          <div className="flex items-center gap-4 text-xs mb-2">
            <button 
              onClick={() => setShowPreviousMonth(!showPreviousMonth)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showPreviousMonth ? 'bg-indigo-100' : 'bg-gray-100 opacity-50'}`}
            >
              <span className={`w-3 h-3 rounded-full ${showPreviousMonth ? 'bg-indigo-400' : 'bg-gray-400'}`}></span>
              Previous Month
            </button>
            <button 
              onClick={() => setShowCurrentMonth(!showCurrentMonth)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${showCurrentMonth ? 'bg-indigo-100' : 'bg-gray-100 opacity-50'}`}
            >
              <span className={`w-3 h-3 rounded-full ${showCurrentMonth ? 'bg-indigo-600' : 'bg-gray-400'}`}></span>
              Current Month
            </button>
          </div>
          <div style={{ height: '200px' }}>
            {monthToMonthData && monthToMonthData.length > 0 ? (
              <BarChart
                labels={monthToMonthData.map(m => m.departmentName?.substring(0, 15) || '')}
                datasets={[
                  ...(showPreviousMonth ? [{
                    label: 'Previous',
                    data: monthToMonthData.map(m => m.previousMonth),
                    backgroundColor: '#a5b4fc'
                  }] : []),
                  ...(showCurrentMonth ? [{
                    label: 'Current',
                    data: monthToMonthData.map(m => m.currentMonth),
                    backgroundColor: '#6366f1'
                  }] : [])
                ]}
                height={200}
                showLegend={false}
                showValues={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Print Footer */}
        {printMode && (
          <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
            Forbes Dashboard - Executive Summary Report
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          #dashboard-summary-content { padding: 8mm !important; }
        }
        @page { size: A4 landscape; margin: 8mm; }
        .print-mode #dashboard-summary-content { max-height: none !important; overflow: visible !important; }
      `}</style>
    </div>
  );
};

export default DashboardSummaryReport;
