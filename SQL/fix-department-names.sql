-- Fix department names with trailing whitespace
-- This script trims whitespace from department names

-- First, check which departments have trailing/leading whitespace
SELECT id, name, CONCAT('[', name, ']') as name_with_brackets
FROM departments
WHERE name != TRIM(name);

-- Fix the department names by trimming whitespace
UPDATE departments
SET name = TRIM(name)
WHERE name != TRIM(name);

-- Verify the fix
SELECT id, name FROM departments ORDER BY id;
