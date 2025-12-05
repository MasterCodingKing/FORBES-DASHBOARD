-- Fix departments table datetime issue
-- First, update any existing invalid datetime values in the departments table
-- Then add the created_at and updated_at columns properly

USE dashboard_db;

-- Check if created_at column exists, if so, drop it first
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dashboard_db' 
               AND TABLE_NAME = 'departments' 
               AND COLUMN_NAME = 'created_at');

SET @sqlstmt := IF(@exist > 0, 
    'ALTER TABLE departments DROP COLUMN created_at',
    'SELECT ''Column created_at does not exist'' AS Info');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if updated_at column exists, if so, drop it first
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'dashboard_db' 
               AND TABLE_NAME = 'departments' 
               AND COLUMN_NAME = 'updated_at');

SET @sqlstmt := IF(@exist > 0, 
    'ALTER TABLE departments DROP COLUMN updated_at',
    'SELECT ''Column updated_at does not exist'' AS Info');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now add the columns with default values
ALTER TABLE departments 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing rows to have proper datetime values
UPDATE departments 
SET created_at = CURRENT_TIMESTAMP, 
    updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL OR updated_at IS NULL;

SELECT 'Departments table fixed successfully!' AS Result;
