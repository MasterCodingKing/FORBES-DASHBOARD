const { Op, fn, col, literal } = require('sequelize');
const { Sale, Expense, Department, sequelize } = require('../models');
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

  // Fill in all months with data or zero
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: getMonthName(i + 1),
    total: 0
  }));

  result.forEach(item => {
    const monthIndex = parseInt(item.month) - 1;
    monthlyData[monthIndex].total = parseFloat(item.total);
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
    monthlyData[monthIndex].total = parseFloat(item.total);
  });

  const yearTotal = monthlyData.reduce((sum, m) => sum + m.total, 0);

  return { months: monthlyData, yearTotal };
};

/**
 * Get monthly income (revenue - expenses) for the current year
 */
const getMonthlyIncome = async (year = new Date().getFullYear()) => {
  const revenue = await getMonthlyRevenue(year);
  const expenses = await getMonthlyExpenses(year);

  const monthlyData = revenue.months.map((rev, index) => ({
    month: rev.month,
    monthName: rev.monthName,
    revenue: rev.total,
    expenses: expenses.months[index].total,
    income: rev.total - expenses.months[index].total
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
 */
const getYTDSalesComparison = async () => {
  const currentYear = new Date().getFullYear();
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
    };
  });

  return {
    comparison,
    currentYearTotal: currentYearData.yearTotal,
    previousYearTotal: previousYearData.yearTotal,
    variance: currentYearData.yearTotal - previousYearData.yearTotal
  };
};

/**
 * Get year-to-date income comparison
 */
const getYTDIncomeComparison = async () => {
  const currentYear = new Date().getFullYear();
  const currentYearData = await getMonthlyIncome(currentYear);
  const previousYearData = await getMonthlyIncome(currentYear - 1);

  const comparison = currentYearData.months.map((current, index) => {
    const previous = previousYearData.months[index];
    const variance = current.income - previous.income;

    return {
      month: current.month,
      monthName: current.monthName,
      currentYear: current.income,
      previousYear: previous.income,
      variance
    };
  });

  return {
    comparison,
    currentYearTotal: currentYearData.yearTotal,
    previousYearTotal: previousYearData.yearTotal,
    variance: currentYearData.yearTotal - previousYearData.yearTotal
  };
};

/**
 * Get services dashboard data for a specific department and month
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

  // Get target month total for daily average
  const { startDate: targetStart, endDate: targetEnd } = getMonthRange(targetYear, targetMonth);
  
  const targetTotal = await Sale.sum('amount', {
    where: {
      department_id: departmentId,
      date: { [Op.between]: [targetStart, targetEnd] }
    }
  }) || 0;

  const daysInDisplayMonth = getDaysInMonth(displayYear, displayMonth);
  const daysInTargetMonth = getDaysInMonth(targetYear, targetMonth);
  const dailyTarget = targetTotal / daysInTargetMonth;

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
    targetMonth,
    targetYear,
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

module.exports = {
  getMonthlyRevenue,
  getMonthlyExpenses,
  getMonthlyIncome,
  getServiceBreakdown,
  getMonthToMonthComparison,
  getYTDSalesComparison,
  getYTDIncomeComparison,
  getServicesDashboardData
};
