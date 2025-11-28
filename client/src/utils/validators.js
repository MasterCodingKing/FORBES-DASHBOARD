/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate username (alphanumeric + underscore, min 3 chars)
 */
export const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,}$/;
  return regex.test(username);
};

/**
 * Validate password (min 6 chars)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate name (letters and spaces only)
 */
export const isValidName = (name) => {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(name);
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate date
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate form fields
 */
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      if (rule.required && !isRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
        break;
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
        break;
      }

      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field} must be at most ${rule.maxLength} characters`;
        break;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} format is invalid`;
        break;
      }

      if (rule.custom && !rule.custom(value, values)) {
        errors[field] = rule.message || `${field} is invalid`;
        break;
      }
    }
  });

  return errors;
};

/**
 * User form validation rules
 */
export const userValidationRules = {
  first_name: [
    { required: true, message: 'First name is required' },
    { pattern: /^[a-zA-Z\s]+$/, message: 'First name can only contain letters and spaces' }
  ],
  last_name: [
    { required: true, message: 'Last name is required' },
    { pattern: /^[a-zA-Z\s]+$/, message: 'Last name can only contain letters and spaces' }
  ],
  username: [
    { required: true, message: 'Username is required' },
    { minLength: 3, message: 'Username must be at least 3 characters' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters' }
  ],
  confirm_password: [
    { required: true, message: 'Please confirm your password' },
    { custom: (value, values) => value === values.password, message: 'Passwords do not match' }
  ]
};

/**
 * Sale form validation rules
 */
export const saleValidationRules = {
  department_id: [
    { required: true, message: 'Please select a service' }
  ],
  amount: [
    { required: true, message: 'Amount is required' },
    { custom: (value) => isPositiveNumber(value), message: 'Amount must be a positive number' }
  ],
  date: [
    { required: true, message: 'Date is required' },
    { custom: (value) => isValidDate(value), message: 'Invalid date' }
  ]
};

/**
 * Expense form validation rules
 */
export const expenseValidationRules = {
  description: [
    { required: true, message: 'Description is required' },
    { maxLength: 255, message: 'Description cannot exceed 255 characters' }
  ],
  amount: [
    { required: true, message: 'Amount is required' },
    { custom: (value) => isPositiveNumber(value), message: 'Amount must be a positive number' }
  ],
  date: [
    { required: true, message: 'Date is required' },
    { custom: (value) => isValidDate(value), message: 'Invalid date' }
  ],
  category: [
    { required: true, message: 'Please select a category' }
  ]
};

/**
 * Validate sale form data
 */
export const validateSale = (data) => {
  const errors = {};

  if (!data.department_id) {
    errors.department_id = 'Please select a service';
  }

  if (!data.amount) {
    errors.amount = 'Amount is required';
  } else if (!isPositiveNumber(data.amount)) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!data.sale_date) {
    errors.sale_date = 'Sale date is required';
  } else if (!isValidDate(data.sale_date)) {
    errors.sale_date = 'Invalid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate expense form data
 */
export const validateExpense = (data) => {
  const errors = {};

  if (!data.category) {
    errors.category = 'Please select a category';
  }

  if (!data.amount) {
    errors.amount = 'Amount is required';
  } else if (!isPositiveNumber(data.amount)) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!data.expense_date) {
    errors.expense_date = 'Expense date is required';
  } else if (!isValidDate(data.expense_date)) {
    errors.expense_date = 'Invalid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user form data
 */
export const validateUser = (data, isCreate = true) => {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (isCreate) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
