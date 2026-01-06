/**
 * Format number as Philippine Peso currency
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string with peso sign
 */
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

module.exports = formatCurrency;
