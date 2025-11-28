/**
 * Get the start and end dates of a specific month
 */
const getMonthRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Get the start and end dates of the current month
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  return getMonthRange(now.getFullYear(), now.getMonth() + 1);
};

/**
 * Get the start and end dates of the previous month
 */
const getPreviousMonthRange = () => {
  const now = new Date();
  const prevMonth = now.getMonth(); // 0-indexed, so this gives previous month
  const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = prevMonth === 0 ? 12 : prevMonth;
  return getMonthRange(year, month);
};

/**
 * Get the start and end dates of a year
 */
const getYearRange = (year) => {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  };
};

/**
 * Get current year range
 */
const getCurrentYearRange = () => {
  const year = new Date().getFullYear();
  return getYearRange(year);
};

/**
 * Get previous year range
 */
const getPreviousYearRange = () => {
  const year = new Date().getFullYear() - 1;
  return getYearRange(year);
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
};

/**
 * Get month name from month number (1-12)
 */
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

/**
 * Get short month name
 */
const getShortMonthName = (month) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month - 1];
};

/**
 * Get number of days in a month
 */
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

module.exports = {
  getMonthRange,
  getCurrentMonthRange,
  getPreviousMonthRange,
  getYearRange,
  getCurrentYearRange,
  getPreviousYearRange,
  formatDate,
  getMonthName,
  getShortMonthName,
  getDaysInMonth
};
