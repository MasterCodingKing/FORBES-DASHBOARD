const { Op, fn, col, literal } = require('sequelize');
const { Sale, Expense, Department, MonthlyTarget, NOI, sequelize } = require('../models');
const {
  getMonthRange,
  getCurrentMonthRange,
  getPreviousMonthRange,
  getYearRange,
  getCurrentYearRange,
  getPreviousYearRange,
  getMonthName,
  getDaysInMonth
} = require('../utils/dateHelpers');

/**
 * Get monthly revenue data for the current year
 * Revenue = Sales Revenue only (NOI is NOT included in revenue)
 * NOI is stored separately for use in income calculations
 */
const getMonthlyRevenue = async (year = new Date().getFullYear()) => {
  const { startDate, endDate } = getYearRange(year);
  
  const result = await Sale.findAll({
    attributes: [
      [fn('MONTH', col('date')), 'month'],
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [startDate, endDate] }
    },
    group: [fn('MONTH', col('date'))],
    order: [[fn('MONTH', col('date')), 'ASC']],
    raw: true
  });

  // Get NOI data from NOI table
  const noiData = await NOI.findAll({
    attributes: [
      'month',
      [col('noi_amount'), 'total_noi']
    ],
    where: {
      year: year
    },
    raw: true
  });

  // Create a map of NOI amounts by month
  const noiByMonth = {};
  noiData.forEach(item => {
    const monthNum = parseInt(item.month);
    const noiValue = parseFloat(item.total_noi);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      noiByMonth[monthNum] = isNaN(noiValue) ? 0 : noiValue;
    }
  });

  // Fill in all months with data or zero
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: getMonthName(i + 1),
    salesRevenue: 0,
    noi: 0,
    total: 0
  }));

  result.forEach(item => {
    const monthIndex = parseInt(item.month) - 1;
    const salesValue = parseFloat(item.total);
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyData[monthIndex].salesRevenue = isNaN(salesValue) ? 0 : salesValue;
    }
  });

  // Set NOI separately (NOI only applies to income, not revenue)
  // Revenue = Sales Revenue only (no NOI)
  monthlyData.forEach((month, index) => {
    month.noi = noiByMonth[month.month] || 0;
    month.total = month.salesRevenue; // Revenue does NOT include NOI
  });

  const yearTotal = monthlyData.reduce((sum, m) => sum + m.total, 0);

  return { months: monthlyData, yearTotal };
};

/**
 * Get monthly expenses data for the current year
 */
const getMonthlyExpenses = async (year = new Date().getFullYear()) => {
  const { startDate, endDate } = getYearRange(year);
  
  const result = await Expense.findAll({
    attributes: [
      [fn('MONTH', col('date')), 'month'],
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [startDate, endDate] }
    },
    group: [fn('MONTH', col('date'))],
    order: [[fn('MONTH', col('date')), 'ASC']],
    raw: true
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: getMonthName(i + 1),
    total: 0
  }));

  result.forEach(item => {
    const monthIndex = parseInt(item.month) - 1;
    const expenseValue = parseFloat(item.total);
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyData[monthIndex].total = isNaN(expenseValue) ? 0 : expenseValue;
    }
  });

  const yearTotal = monthlyData.reduce((sum, m) => sum + m.total, 0);

  return { months: monthlyData, yearTotal };
};

/**
 * Get monthly income (revenue - expenses + NOI) for the current year
 * Formula: Income = Sales Revenue - Total Expenses + NOI
 */
const getMonthlyIncome = async (year = new Date().getFullYear()) => {
  const revenue = await getMonthlyRevenue(year);
  const expenses = await getMonthlyExpenses(year);

  const monthlyData = revenue.months.map((rev, index) => ({
    month: rev.month,
    monthName: rev.monthName,
    salesRevenue: rev.salesRevenue,
    noi: rev.noi,
    revenue: rev.salesRevenue, // Sales revenue only (not including NOI separately)
    expenses: expenses.months[index].total,
    income: rev.salesRevenue - expenses.months[index].total + rev.noi
  }));

  const yearTotal = monthlyData.reduce((sum, m) => sum + m.income, 0);

  return { months: monthlyData, yearTotal };
};

/**
 * Get service breakdown for a specific month
 */
const getServiceBreakdown = async (year, month) => {
  const { startDate, endDate } = getMonthRange(year, month);

  const result = await Sale.findAll({
    attributes: [
      'department_id',
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [startDate, endDate] }
    },
    include: [{
      model: Department,
      as: 'department',
      attributes: ['name']
    }],
    group: ['department_id', 'department.id'],
    raw: true,
    nest: true
  });

  const totalRevenue = result.reduce((sum, item) => sum + parseFloat(item.total), 0);

  const breakdown = result.map(item => ({
    departmentId: item.department_id,
    departmentName: item.department.name,
    revenue: parseFloat(item.total),
    percentage: totalRevenue > 0 ? ((parseFloat(item.total) / totalRevenue) * 100).toFixed(2) : 0
  }));

  return { breakdown, totalRevenue };
};

/**
 * Get month-to-month comparison
 */
const getMonthToMonthComparison = async () => {
  const currentMonth = getCurrentMonthRange();
  const previousMonth = getPreviousMonthRange();

  // Get current month sales by department
  const currentSales = await Sale.findAll({
    attributes: [
      'department_id',
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [currentMonth.startDate, currentMonth.endDate] }
    },
    include: [{
      model: Department,
      as: 'department',
      attributes: ['name']
    }],
    group: ['department_id', 'department.id'],
    raw: true,
    nest: true
  });

  // Get previous month sales by department
  const previousSales = await Sale.findAll({
    attributes: [
      'department_id',
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [previousMonth.startDate, previousMonth.endDate] }
    },
    include: [{
      model: Department,
      as: 'department',
      attributes: ['name']
    }],
    group: ['department_id', 'department.id'],
    raw: true,
    nest: true
  });

  // Get all departments
  const departments = await Department.findAll({ raw: true });

  // Merge data
  const comparison = departments.map(dept => {
    const current = currentSales.find(s => s.department_id === dept.id);
    const previous = previousSales.find(s => s.department_id === dept.id);
    const currentAmount = current ? parseFloat(current.total) : 0;
    const previousAmount = previous ? parseFloat(previous.total) : 0;
    const difference = currentAmount - previousAmount;
    const percentChange = previousAmount > 0 
      ? ((difference / previousAmount) * 100).toFixed(2) 
      : (currentAmount > 0 ? 100 : 0);

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      previousMonth: previousAmount,
      currentMonth: currentAmount,
      difference,
      percentChange: parseFloat(percentChange)
    };
  });

  // Calculate totals
  const totalPrevious = comparison.reduce((sum, c) => sum + c.previousMonth, 0);
  const totalCurrent = comparison.reduce((sum, c) => sum + c.currentMonth, 0);
  const totalDifference = totalCurrent - totalPrevious;
  const totalPercentChange = totalPrevious > 0 
    ? ((totalDifference / totalPrevious) * 100).toFixed(2) 
    : (totalCurrent > 0 ? 100 : 0);

  return {
    comparison,
    totals: {
      previousMonth: totalPrevious,
      currentMonth: totalCurrent,
      difference: totalDifference,
      percentChange: parseFloat(totalPercentChange)
    }
  };
};

/**
 * Get year-to-date sales comparison
 * Sales/Revenue does NOT include NOI - NOI only applies to income
 */
const getYTDSalesComparison = async (year = null) => {
  const currentYear = year || new Date().getFullYear();
  const currentYearData = await getMonthlyRevenue(currentYear);
  const previousYearData = await getMonthlyRevenue(currentYear - 1);

  const comparison = currentYearData.months.map((current, index) => {
    const previous = previousYearData.months[index];
    const variance = current.total - previous.total;

    return {
      month: current.month,
      monthName: current.monthName,
      currentYear: current.total,
      previousYear: previous.total,
      variance
      // NOI is NOT included in sales/revenue comparison
    };
  });

  return {
    comparison,
    currentYearTotal: currentYearData.yearTotal,
    previousYearTotal: previousYearData.yearTotal,
    variance: currentYearData.yearTotal - previousYearData.yearTotal,
    // Do NOT include NOI in sales comparison - NOI only applies to income
    year: currentYear
  };
};

/**
 * Get year-to-date income comparison
 * Includes NOI variance calculation
 */
const getYTDIncomeComparison = async (year = null) => {
  const currentYear = year || new Date().getFullYear();
  const currentYearData = await getMonthlyIncome(currentYear);
  const previousYearData = await getMonthlyIncome(currentYear - 1);

  const comparison = currentYearData.months.map((current, index) => {
    const previous = previousYearData.months[index];
    const variance = current.income - previous.income;
    const noiVariance = current.noi - previous.noi;

    return {
      month: current.month,
      monthName: current.monthName,
      currentYear: current.income,
      previousYear: previous.income,
      variance,
      currentYearNOI: current.noi,
      previousYearNOI: previous.noi,
      noiVariance
    };
  });

  // Calculate overall NOI variance (total NOI current year - total NOI previous year)
  const currentYearTotalNOI = currentYearData.months.reduce((sum, m) => sum + m.noi, 0);
  const previousYearTotalNOI = previousYearData.months.reduce((sum, m) => sum + m.noi, 0);
  const totalNOIVariance = currentYearTotalNOI - previousYearTotalNOI;

  return {
    comparison,
    currentYearTotal: currentYearData.yearTotal,
    previousYearTotal: previousYearData.yearTotal,
    variance: currentYearData.yearTotal - previousYearData.yearTotal,
    currentYearTotalNOI,
    previousYearTotalNOI,
    totalNOIVariance,
    year: currentYear
  };
};

/**
 * Get services dashboard data for a specific department and month
 * Now uses MonthlyTarget table for target amounts
 */
const getServicesDashboardData = async (departmentId, displayMonth, displayYear, targetMonth, targetYear) => {
  // Get display month sales
  const { startDate: displayStart, endDate: displayEnd } = getMonthRange(displayYear, displayMonth);
  
  const displaySales = await Sale.findAll({
    attributes: [
      [fn('DAY', col('date')), 'day'],
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      department_id: departmentId,
      date: { [Op.between]: [displayStart, displayEnd] }
    },
    group: [fn('DAY', col('date'))],
    order: [[fn('DAY', col('date')), 'ASC']],
    raw: true
  });

  // Get the monthly target for the display month from MonthlyTarget table
  const monthlyTarget = await MonthlyTarget.findOne({
    where: {
      department_id: departmentId,
      year: displayYear,
      month: displayMonth
    }
  });

  // Use monthly target if set, otherwise fall back to department target
  let targetTotal = 0;
  let targetSource = 'none';
  
  if (monthlyTarget) {
    targetTotal = parseFloat(monthlyTarget.target_amount) || 0;
    targetSource = 'monthly';
  } else {
    // Fallback to department's default target if no monthly target is set
    const department = await Department.findByPk(departmentId);
    if (department && department.target) {
      targetTotal = parseFloat(department.target) || 0;
      targetSource = 'department';
    }
  }

  const daysInDisplayMonth = getDaysInMonth(displayYear, displayMonth);
  const dailyTarget = targetTotal / daysInDisplayMonth;

  // Build daily breakdown
  const dailyBreakdown = Array.from({ length: daysInDisplayMonth }, (_, i) => {
    const day = i + 1;
    const saleData = displaySales.find(s => parseInt(s.day) === day);
    const sales = saleData ? parseFloat(saleData.total) : 0;
    const variance = sales - dailyTarget;

    return {
      day,
      sales,
      target: dailyTarget,
      variance
    };
  });

  const totalSales = dailyBreakdown.reduce((sum, d) => sum + d.sales, 0);
  const totalVariance = totalSales - targetTotal;
  const percentOfTarget = targetTotal > 0 ? ((totalSales / targetTotal) * 100).toFixed(2) : 0;

  return {
    departmentId,
    displayMonth,
    displayYear,
    targetMonth: displayMonth,
    targetYear: displayYear,
    targetSource,
    stats: {
      sales: totalSales,
      target: targetTotal,
      percentOfTarget: parseFloat(percentOfTarget),
      difference: totalVariance
    },
    dailyBreakdown,
    dailyTarget
  };
};

/**
 * Get yearly service breakdown with monthly data
 */
const getYearlyServiceBreakdown = async (year = new Date().getFullYear()) => {
  const { startDate, endDate } = getYearRange(year);
  
  const result = await Sale.findAll({
    attributes: [
      [fn('MONTH', col('date')), 'month'],
      'department_id',
      [fn('SUM', col('amount')), 'total']
    ],
    where: {
      date: { [Op.between]: [startDate, endDate] }
    },
    include: [{
      model: Department,
      as: 'department',
      attributes: ['name']
    }],
    group: [fn('MONTH', col('date')), 'department_id', 'department.id'],
    order: [[fn('MONTH', col('date')), 'ASC']],
    raw: true,
    nest: true
  });

  // Get all departments
  const departments = await Department.findAll({
    attributes: ['id', 'name'],
    raw: true
  });

  // Create month structure with all departments
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthData = {
      month: i + 1,
      monthName: getMonthName(i + 1),
      total: 0,
      services: {}
    };
    
    // Initialize all departments with 0
    departments.forEach(dept => {
      monthData.services[dept.name] = 0;
    });
    
    return monthData;
  });

  // Fill in the actual data
  result.forEach(item => {
    const monthIndex = parseInt(item.month) - 1;
    const amount = parseFloat(item.total);
    
    // Guard against invalid month index and NaN amounts
    if (monthIndex >= 0 && monthIndex < 12) {
      const validAmount = isNaN(amount) ? 0 : amount;
      monthlyData[monthIndex].total += validAmount;
      if (item.department && item.department.name) {
        monthlyData[monthIndex].services[item.department.name] = validAmount;
      }
    }
  });

  return { 
    months: monthlyData,
    departments: departments.map(d => d.name)
  };
};

module.exports = {
  getMonthlyRevenue,
  getMonthlyExpenses,
  getMonthlyIncome,
  getServiceBreakdown,
  getYearlyServiceBreakdown,
  getMonthToMonthComparison,
  getYTDSalesComparison,
  getYTDIncomeComparison,
  getServicesDashboardData
};
