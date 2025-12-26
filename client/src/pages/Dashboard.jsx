import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import salesService from '../services/salesService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { AUTO_REFRESH_INTERVAL } from '../utils/constants';

import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import IncomeChart from '../components/dashboard/IncomeChart';
import ServiceBreakdown from '../components/dashboard/ServiceBreakdown';
import MonthToMonthComparison from '../components/dashboard/MonthToMonthComparison';
import YTDComparative from '../components/dashboard/YTDComparative';
import MonthlySalesTable from '../components/dashboard/MonthlySalesTable';
import DailySalesChart from '../components/dashboard/DailySalesChart';
import MonthToMonthIncomeChart from '../components/dashboard/MonthToMonthIncomeChart';
import { DailyComparisonChart } from '../components/sales';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [prevYearIncome, setPrevYearIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch base dashboard data and year/month-specific data in parallel
      const [baseResponse, yearlyRevenueResp, yearlyIncomeResp, prevYearIncomeResp, serviceBreakdownResp] = await Promise.all([
        dashboardService.getMainDashboard(selectedYear, selectedMonth),
        dashboardService.getYearlyRevenue(selectedYear),
        dashboardService.getYearlyIncome(selectedYear),
        dashboardService.getYearlyIncome(selectedYear - 1),
        dashboardService.getServiceBreakdown(selectedYear, selectedMonth)
      ]);

      const baseData = baseResponse.success ? baseResponse.data : {};
      
      // Merge year/month-specific data with base data
      const mergedData = {
        ...baseData,
        monthlyRevenue: yearlyRevenueResp.data || baseData.monthlyRevenue,
        monthlyIncome: yearlyIncomeResp.data || baseData.monthlyIncome,
        serviceBreakdown: serviceBreakdownResp.data || baseData.serviceBreakdown,
        lastUpdated: baseData.lastUpdated || new Date().toISOString()
      };

      setData(mergedData);
      setPrevYearIncome(prevYearIncomeResp.data || null);
      setLastUpdated(new Date(mergedData.lastUpdated));

      // Fetch sales data for day-to-day comparison using selected filters
      const currentMonth = selectedMonth;
      const currentYear = selectedYear;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const [currentSalesResponse, prevSalesResponse] = await Promise.all([
        salesService.getAll({ month: currentMonth, year: currentYear, limit: 10000 }),
        salesService.getAll({ month: prevMonth, year: prevYear, limit: 10000 })
      ]);

      const currentSales = currentSalesResponse.data?.sales || [];
      const prevSales = prevSalesResponse.data?.sales || [];
      setSalesData([...currentSales, ...prevSales]);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { refresh } = useAutoRefresh(fetchDashboardData, AUTO_REFRESH_INTERVAL, true);

  // Calculate stats from data
  const getStats = () => {
    if (!data) return null;

    const { monthlyRevenue, monthlyIncome, monthToMonth } = data;
    const currentMonth = selectedMonth - 1;

    return {
      totalRevenue: monthlyRevenue?.yearTotal || 0,
      totalIncome: monthlyIncome?.yearTotal || 0,
      currentMonthRevenue: monthlyRevenue?.months?.[currentMonth]?.total || 0,
      monthChange: monthToMonth?.totals?.percentChange || 0
    };
  };

  const stats = getStats();

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">
            Welcome to your business analytics dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {[
                'January','February','March','April','May','June','July','August','September','October','November','December'
              ].map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>

            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {(() => {
                const years = [];
                const cy = new Date().getFullYear();
                for (let y = cy - 4; y <= cy + 1; y++) years.push(y);
                return years;
              })().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {formatRelativeTime(lastUpdated)}
            </span>
          )}
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Year Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Year Total Income Net"
          value={formatCurrency(stats?.totalIncome || 0)}
          color="success"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatsCard
          title="Current Month"
          value={formatCurrency(stats?.currentMonthRevenue || 0)}
          color="info"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Month Change"
          value={`${stats?.monthChange >= 0 ? '+' : ''}${stats?.monthChange?.toFixed(1)}%`}
          color={stats?.monthChange >= 0 ? 'success' : 'danger'}
          trend={stats?.monthChange >= 0 ? 'up' : 'down'}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={data?.monthlyRevenue} loading={loading} />
        <IncomeChart data={data?.monthlyIncome} loading={loading} />
      </div>

      {/* Daily Sales Chart */}
      <div className="mb-6">
        <DailySalesChart 
          data={salesData}
          loading={loading}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>

      {/* Month to Month Income Comparison */}
      <div className="mb-6">
        <MonthToMonthIncomeChart
          currentYearData={data?.monthlyIncome}
          previousYearData={prevYearIncome}
          loading={loading}
          year={selectedYear}
        />
      </div>

      {/* Day-to-Day Comparison Chart */}
      <div className="mb-6">
        <DailyComparisonChart
          sales={salesData}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ServiceBreakdown data={data?.serviceBreakdown} loading={loading} />
        <MonthToMonthComparison data={data?.monthToMonth} loading={loading} />
      </div>

      {/* Monthly Sales Table */}
      <div className="mb-6">
        <MonthlySalesTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <YTDComparative data={data?.ytdSales} loading={loading} type="sales" />
        <YTDComparative data={data?.ytdIncome} loading={loading} type="income" />
      </div>
    </div>
  );
};

export default Dashboard;
