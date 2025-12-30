-- Update expense_categories table to use account_number instead of code
-- Run this if you already have the expense_categories table

-- Step 1: Add account_number column (ignore if exists)
ALTER TABLE expense_categories 
ADD COLUMN account_number VARCHAR(50) AFTER code;
