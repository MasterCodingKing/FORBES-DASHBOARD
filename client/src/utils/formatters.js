/**
 * Format number as Philippine Peso currency
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Format number with commas
 */
export const formatNumber = (number, decimals = 2) => {
  const num = parseFloat(number) || 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 2) => {
  const num = parseFloat(value) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 * Handles ISO date strings by parsing date parts directly to avoid timezone issues
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  // Handle string dates to avoid timezone issues
  if (typeof date === 'string') {
    const datePart = date.split('T')[0]; // Get "YYYY-MM-DD" part
    const parts = datePart.split('-');
    if (parts.length === 3) {
      // Create date using local timezone by specifying the parts
      const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return localDate.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    }
  }
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
export const formatDateInput = (date) => {
  // Handle string dates to avoid timezone issues
  if (typeof date === 'string') {
    const datePart = date.split('T')[0]; // Get "YYYY-MM-DD" part
    if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return datePart;
    }
  }
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format datetime
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get month name
 */
export const getMonthName = (month, short = false) => {
  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
};
