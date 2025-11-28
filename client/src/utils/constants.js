// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auto-refresh interval (30 seconds)
export const AUTO_REFRESH_INTERVAL = 30000;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Expense categories
export const EXPENSE_CATEGORIES = [
  'General',
  'Utilities',
  'Supplies',
  'Marketing',
  'Salaries',
  'Rent',
  'Equipment',
  'Travel',
  'Maintenance',
  'Other'
];

// Chart colors
export const CHART_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  purple: '#9b59b6',
  teal: '#1abc9c',
  orange: '#e67e22',
  dark: '#34495e'
};

// Chart color palette for pie/doughnut charts
export const CHART_PALETTE = [
  '#667eea',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#3498db',
  '#34495e',
  '#764ba2'
];

// Months array
export const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' }
];

// Years (current year and 5 years back)
export const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => currentYear - i);
};

// Navigation items
export const NAV_ITEMS = {
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: 'chart-bar' },
    { path: '/services/dashboard', label: 'Services Dashboard', icon: 'building' },
    { path: '/sales', label: 'Sales', icon: 'dollar' },
    { path: '/expenses', label: 'Expenses', icon: 'receipt' },
    { path: '/services', label: 'Services', icon: 'cog' },
    { path: '/users', label: 'Users', icon: 'users' }
  ],
  user: [
    { path: '/services/dashboard', label: 'Services Dashboard', icon: 'building' },
    { path: '/sales', label: 'Sales', icon: 'dollar' },
    { path: '/expenses', label: 'Expenses', icon: 'receipt' }
  ]
};
