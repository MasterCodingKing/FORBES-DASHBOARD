-- Fix for permissions being stored as TEXT instead of JSON
-- This will convert the column type and fix existing data

-- Step 1: Check current column type
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('permissions', 'allowed_modules', 'allowed_reports');

-- Step 2: Convert column to JSON type (if it's TEXT or VARCHAR)
ALTER TABLE users 
MODIFY COLUMN permissions JSON DEFAULT NULL 
COMMENT 'JSON object with granular permissions';

ALTER TABLE users 
MODIFY COLUMN allowed_modules JSON DEFAULT NULL 
COMMENT 'JSON array of allowed module names';

ALTER TABLE users 
MODIFY COLUMN allowed_reports JSON DEFAULT NULL 
COMMENT 'JSON array of allowed report IDs';

-- Step 3: Fix existing stringified JSON data
-- This will parse any string values and convert them to proper JSON
UPDATE users 
SET permissions = CAST(permissions AS JSON)
WHERE permissions IS NOT NULL 
AND JSON_VALID(permissions) = 1;

UPDATE users 
SET allowed_modules = CAST(allowed_modules AS JSON)
WHERE allowed_modules IS NOT NULL 
AND JSON_VALID(allowed_modules) = 1;

UPDATE users 
SET allowed_reports = CAST(allowed_reports AS JSON)
WHERE allowed_reports IS NOT NULL 
AND JSON_VALID(allowed_reports) = 1;

-- Step 4: Verify the fix
SELECT 
    id,
    username,
    JSON_TYPE(permissions) as permissions_type,
    permissions,
    JSON_TYPE(allowed_modules) as modules_type,
    JSON_TYPE(allowed_reports) as reports_type
FROM users
LIMIT 5;
