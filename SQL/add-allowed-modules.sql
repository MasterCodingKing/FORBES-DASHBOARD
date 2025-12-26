-- Add allowed_modules column to users table for module-level access control
-- This allows restricting users to only access specific modules

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS allowed_modules JSON DEFAULT NULL 
COMMENT 'JSON array of allowed module names (e.g., ["sales", "expenses", "dashboard"]). Null means all modules allowed.';

-- Update existing users to have NULL (all modules allowed)
UPDATE users SET allowed_modules = NULL WHERE allowed_modules IS NULL;

-- Example: To restrict a user to only expenses module
-- UPDATE users SET allowed_modules = '["expenses"]' WHERE id = 5;

-- Example: To restrict a user to sales and expenses modules
-- UPDATE users SET allowed_modules = '["sales", "expenses"]' WHERE id = 5;

-- Example: To allow all modules again (reset)
-- UPDATE users SET allowed_modules = NULL WHERE id = 5;
