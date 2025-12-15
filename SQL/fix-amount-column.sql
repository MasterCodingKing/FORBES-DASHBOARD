-- Fix amount column size in sales and expenses tables
-- Change from DECIMAL(10,2) to DECIMAL(20,2) to support larger amounts

USE `dashboard_db`;

-- Update sales table amount column
ALTER TABLE `sales` 
MODIFY COLUMN `amount` DECIMAL(20, 2) NOT NULL COMMENT 'Sale amount';

-- Update expenses table amount column  
ALTER TABLE `expenses`
MODIFY COLUMN `amount` DECIMAL(20, 2) NOT NULL COMMENT 'Expense amount';

-- Update departments table target column
ALTER TABLE `departments`
MODIFY COLUMN `target` DECIMAL(20, 2) DEFAULT NULL COMMENT 'Monthly target amount';

-- Display the updated schema
DESCRIBE sales;
DESCRIBE expenses;
DESCRIBE departments;