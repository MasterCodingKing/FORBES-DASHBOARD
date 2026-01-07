-- Add allowed_reports column to users table
-- This column stores which specific reports a user can access
-- If NULL or empty array, user has access to all reports

ALTER TABLE users 
ADD COLUMN allowed_reports JSON DEFAULT NULL AFTER allowed_modules;

-- Update existing users to have NULL (all reports accessible by default)
UPDATE users SET allowed_reports = NULL WHERE allowed_reports IS NULL;
