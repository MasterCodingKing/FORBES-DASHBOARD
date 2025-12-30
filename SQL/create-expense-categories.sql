-- Create expense_categories table (Expense Accounts)
CREATE TABLE IF NOT EXISTS expense_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  account_number VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_account_number (account_number),
  INDEX idx_active (is_active)
);

-- Insert default accounts with auto-generated account numbers
INSERT INTO expense_categories (name, account_number, description, is_active) VALUES
('General', '10000', 'General expenses', TRUE),
('Utilities', '10001', 'Utility bills and services', TRUE),
('Supplies', '10002', 'Office and operational supplies', TRUE),
('Marketing', '10003', 'Marketing and advertising expenses', TRUE),
('Salaries and Wages', '10004', 'Employee salaries and wages', TRUE),
('Rent', '10005', 'Rent and lease payments', TRUE),
('Equipment', '10006', 'Equipment purchases and maintenance', TRUE),
('Travel', '10007', 'Travel and transportation expenses', TRUE),
('Maintenance', '10008', 'Maintenance and repairs', TRUE),
('Other', '10009', 'Other miscellaneous expenses', TRUE);
