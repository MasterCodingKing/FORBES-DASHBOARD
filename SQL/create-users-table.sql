-- =============================================
-- Users Table Schema
-- =============================================
-- This schema creates the users table with all necessary fields
-- for authentication, authorization, and access control.
-- 
-- Created: December 29, 2025
-- Last Updated: December 29, 2025
-- =============================================

-- Drop table if exists (use with caution in production)
-- DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL COMMENT 'User first name',
  last_name VARCHAR(100) NOT NULL COMMENT 'User last name',
  
  -- Authentication
  username VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique username for login',
  password VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt)',
  remember_token VARCHAR(255) DEFAULT NULL COMMENT 'Token for remember me functionality',
  
  -- Authorization & Access Control
  is_admin BOOLEAN DEFAULT FALSE COMMENT 'Legacy admin flag (deprecated, use role instead)',
  role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user' COMMENT 'User role: admin (full access), user (normal access), viewer (read-only)',
  
  -- Granular Permissions (JSON)
  permissions JSON DEFAULT NULL COMMENT 'JSON object with granular permissions: {view_dashboard: true, create_sales: true, etc.}',
  
  -- Module Access Control (JSON)
  allowed_modules JSON DEFAULT NULL COMMENT 'JSON array of allowed modules: ["sales", "expenses", "dashboard"]. NULL means all modules allowed.',
  
  -- Account Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Account active status. Inactive users cannot login.',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  
  -- Indexes
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users table for authentication and authorization';

-- =============================================
-- Sample Data Insert (Optional)
-- =============================================
-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt salt rounds = 10

-- =============================================
-- Verification Queries
-- =============================================

-- Check if table was created successfully
-- SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME, UPDATE_TIME 
-- FROM information_schema.TABLES 
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users';

-- View table structure
-- DESCRIBE users;

-- View all users
-- SELECT id, username, role, is_active, created_at FROM users;

-- =============================================
-- Migration Notes & ALTER TABLE Commands
-- =============================================
-- If migrating from an older schema:
--
-- 1. Backup your existing users table first!
--    mysqldump -u username -p database_name users > users_backup.sql
--
-- 2. Add missing columns if they don't exist:

-- Add role column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user' 
COMMENT 'User role: admin (full access), user (normal access), viewer (read-only)' 
AFTER is_admin;

-- Add permissions column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSON DEFAULT NULL 
COMMENT 'JSON object with granular permissions' 
AFTER role;

-- Add allowed_modules column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS allowed_modules JSON DEFAULT NULL 
COMMENT 'JSON array of allowed modules' 
AFTER permissions;

-- Add is_active column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE 
COMMENT 'Account active status' 
AFTER allowed_modules;

-- Add remember_token column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS remember_token VARCHAR(255) DEFAULT NULL 
COMMENT 'Token for remember me functionality' 
AFTER password;

-- Add created_at and updated_at if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
COMMENT 'Record creation timestamp';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
COMMENT 'Record last update timestamp';

-- 3. Update role based on is_admin flag for existing users:
UPDATE users SET role = 'admin' WHERE is_admin = TRUE AND role = 'user';
UPDATE users SET role = 'user' WHERE is_admin = FALSE AND role = 'admin';

-- 4. Set default permissions for existing users who don't have permissions set:

-- Set admin permissions (full access)
UPDATE users SET permissions = JSON_OBJECT(
  'view_dashboard', TRUE,
  'view_reports', TRUE,
  'view_sales', TRUE,
  'create_sales', TRUE,
  'edit_sales', TRUE,
  'delete_sales', TRUE,
  'view_expenses', TRUE,
  'create_expenses', TRUE,
  'edit_expenses', TRUE,
  'delete_expenses', TRUE,
  'view_departments', TRUE,
  'manage_departments', TRUE,
  'view_users', TRUE,
  'manage_users', TRUE,
  'view_targets', TRUE,
  'manage_targets', TRUE,
  'view_audit', TRUE,
  'export_data', TRUE
) WHERE role = 'admin' AND permissions IS NULL;

-- Set user permissions (normal access)
UPDATE users SET permissions = JSON_OBJECT(
  'view_dashboard', TRUE,
  'view_reports', TRUE,
  'view_sales', TRUE,
  'create_sales', TRUE,
  'edit_sales', TRUE,
  'view_expenses', TRUE,
  'create_expenses', TRUE,
  'edit_expenses', TRUE,
  'view_departments', TRUE,
  'view_targets', TRUE,
  'export_data', TRUE
) WHERE role = 'user' AND permissions IS NULL;

-- Set viewer permissions (read-only access)
UPDATE users SET permissions = JSON_OBJECT(
  'view_dashboard', TRUE,
  'view_reports', TRUE,
  'view_sales', TRUE,
  'view_expenses', TRUE,
  'view_departments', TRUE,
  'view_targets', TRUE
) WHERE role = 'viewer' AND permissions IS NULL;

-- 5. Add indexes for better performance:
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_username (username);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role (role);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_is_active (is_active);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- =============================================
-- Permissions Reference
-- =============================================
-- Available permission keys:
--
-- Dashboard:
--   - view_dashboard: View main dashboard
--   - view_reports: View reports
--
-- Sales:
--   - view_sales: View sales records
--   - create_sales: Create new sales
--   - edit_sales: Edit existing sales
--   - delete_sales: Delete sales
--
-- Expenses:
--   - view_expenses: View expenses
--   - create_expenses: Create new expenses
--   - edit_expenses: Edit existing expenses
--   - delete_expenses: Delete expenses
--
-- Departments:
--   - view_departments: View departments
--   - manage_departments: Create, edit, delete departments
--
-- Users:
--   - view_users: View users list
--   - manage_users: Create, edit, delete users
--
-- Targets:
--   - view_targets: View targets
--   - manage_targets: Create, edit, delete targets
--
-- Audit:
--   - view_audit: View audit logs
--
-- Export:
--   - export_data: Export data to files

-- =============================================
-- Modules Reference
-- =============================================
-- Available modules:
--   - dashboard
--   - sales
--   - expenses
--   - departments
--   - reports
--   - targets
--   - users
--   - audit
--
-- Example allowed_modules value:
-- ["dashboard", "sales", "expenses"]
--
-- NULL = all modules allowed (default behavior)
