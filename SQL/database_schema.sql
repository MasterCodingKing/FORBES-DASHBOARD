-- ============================================
-- FORBES DASHBOARD - DATABASE SCHEMA
-- ============================================
-- Database: dashboard_db
-- Created: November 28, 2025
-- Description: Complete database schema for the Forbes Dashboard application
-- ============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `dashboard_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `dashboard_db`;

-- ============================================
-- TABLE: users
-- Description: Stores user account information and authentication credentials
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL COMMENT 'User first name',
  `last_name` VARCHAR(100) NOT NULL COMMENT 'User last name',
  `username` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique username for login',
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt)',
  `is_admin` TINYINT(1) DEFAULT 0 COMMENT 'Admin flag (1=admin, 0=regular user)',
  `remember_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token for remember me functionality',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`),
  INDEX `idx_username` (`username`),
  INDEX `idx_is_admin` (`is_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts and authentication';

-- ============================================
-- TABLE: departments
-- Description: Stores department/service information
-- ============================================
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Department/service name',
  `description` TEXT DEFAULT NULL COMMENT 'Department description',
  `target` DECIMAL(20, 2) DEFAULT NULL COMMENT 'Monthly target amount',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Departments and services';

-- ============================================
-- TABLE: sales
-- Description: Stores daily sales records by department
-- ============================================
CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL COMMENT 'Foreign key to departments table',
  `amount` DECIMAL(20, 2) NOT NULL COMMENT 'Sale amount',
  `date` DATE NOT NULL COMMENT 'Sale date',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_department_date` (`department_id`, `date`),
  CONSTRAINT `fk_sales_department` 
    FOREIGN KEY (`department_id`) 
    REFERENCES `departments` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sales transactions by department';

-- ============================================
-- TABLE: expenses
-- Description: Stores expense records with categories
-- ============================================
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL COMMENT 'Expense description',
  `amount` DECIMAL(20, 2) NOT NULL COMMENT 'Expense amount',
  `date` DATE NOT NULL COMMENT 'Expense date',
  `category` VARCHAR(100) DEFAULT 'General' COMMENT 'Expense category',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_category` (`category`),
  INDEX `idx_date_category` (`date`, `category`),
  CONSTRAINT `chk_category` CHECK (`category` IN (
    'General', 'Utilities', 'Supplies', 'Marketing', 
    'Salaries', 'Rent', 'Equipment', 'Travel', 
    'Maintenance', 'Other'
  ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Business expenses tracking';

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert default admin user
-- Username: admin
-- Password: admin123 (you should change this after first login)
-- Note: The actual password hash will be generated by the application
INSERT INTO `users` (`first_name`, `last_name`, `username`, `password`, `is_admin`) 
VALUES ('Admin', 'User', 'admin', '$2a$10$YourHashedPasswordHere', 1)
ON DUPLICATE KEY UPDATE `username` = `username`;

-- Insert sample departments
INSERT INTO `departments` (`name`, `description`) VALUES
('Acrylic Nails', 'Professional acrylic nail services'),
('Gel Nails', 'Gel nail application and design'),
('Manicure', 'Classic and spa manicure services'),
('Pedicure', 'Pedicure and foot care services'),
('Nail Art', 'Custom nail art and design'),
('Other', 'Additional services')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- VIEWS (Optional - For Reporting)
-- ============================================

-- View: Daily sales summary
CREATE OR REPLACE VIEW `v_daily_sales_summary` AS
SELECT 
  s.date,
  d.name AS department_name,
  SUM(s.amount) AS total_sales,
  COUNT(s.id) AS transaction_count
FROM sales s
INNER JOIN departments d ON s.department_id = d.id
GROUP BY s.date, d.id, d.name
ORDER BY s.date DESC, d.name;

-- View: Monthly sales by department
CREATE OR REPLACE VIEW `v_monthly_sales_by_department` AS
SELECT 
  YEAR(s.date) AS year,
  MONTH(s.date) AS month,
  DATE_FORMAT(s.date, '%Y-%m') AS year_month,
  d.name AS department_name,
  SUM(s.amount) AS total_sales,
  COUNT(s.id) AS transaction_count
FROM sales s
INNER JOIN departments d ON s.department_id = d.id
GROUP BY YEAR(s.date), MONTH(s.date), d.id, d.name
ORDER BY year DESC, month DESC, d.name;

-- View: Monthly expense summary
CREATE OR REPLACE VIEW `v_monthly_expense_summary` AS
SELECT 
  YEAR(date) AS year,
  MONTH(date) AS month,
  DATE_FORMAT(date, '%Y-%m') AS year_month,
  category,
  SUM(amount) AS total_amount,
  COUNT(id) AS expense_count
FROM expenses
GROUP BY YEAR(date), MONTH(date), category
ORDER BY year DESC, month DESC, category;

-- View: Profit/Loss summary by month
CREATE OR REPLACE VIEW `v_monthly_profit_loss` AS
SELECT 
  YEAR(date) AS year,
  MONTH(date) AS month,
  DATE_FORMAT(date, '%Y-%m') AS year_month,
  COALESCE(sales_total, 0) AS total_revenue,
  COALESCE(expense_total, 0) AS total_expenses,
  COALESCE(sales_total, 0) - COALESCE(expense_total, 0) AS net_profit
FROM (
  SELECT DISTINCT date FROM sales
  UNION
  SELECT DISTINCT date FROM expenses
) dates
LEFT JOIN (
  SELECT DATE_FORMAT(date, '%Y-%m') AS ym, SUM(amount) AS sales_total
  FROM sales
  GROUP BY DATE_FORMAT(date, '%Y-%m')
) s ON DATE_FORMAT(dates.date, '%Y-%m') = s.ym
LEFT JOIN (
  SELECT DATE_FORMAT(date, '%Y-%m') AS ym, SUM(amount) AS expense_total
  FROM expenses
  GROUP BY DATE_FORMAT(date, '%Y-%m')
) e ON DATE_FORMAT(dates.date, '%Y-%m') = e.ym
GROUP BY YEAR(dates.date), MONTH(dates.date)
ORDER BY year DESC, month DESC;

-- ============================================
-- STORED PROCEDURES (Optional)
-- ============================================

-- Procedure: Get department performance
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `sp_get_department_performance`(
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  SELECT 
    d.id,
    d.name,
    COUNT(s.id) AS total_transactions,
    COALESCE(SUM(s.amount), 0) AS total_sales,
    COALESCE(AVG(s.amount), 0) AS average_sale
  FROM departments d
  LEFT JOIN sales s ON d.id = s.department_id 
    AND s.date BETWEEN p_start_date AND p_end_date
  GROUP BY d.id, d.name
  ORDER BY total_sales DESC;
END //
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS `idx_sales_date_amount` ON `sales` (`date`, `amount`);
CREATE INDEX IF NOT EXISTS `idx_expenses_date_amount` ON `expenses` (`date`, `amount`);

-- ============================================
-- DATABASE INFORMATION
-- ============================================
-- Total Tables: 4 (users, departments, sales, expenses)
-- Total Views: 4 (for reporting and analytics)
-- Total Stored Procedures: 1
-- Relationships:
--   - sales.department_id -> departments.id (CASCADE)
-- ============================================
