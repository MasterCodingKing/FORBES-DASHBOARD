-- Create NOI (Net Operating Income) table
CREATE TABLE IF NOT EXISTS noi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  year INT NOT NULL,
  month INT NOT NULL,
  noi_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_year_month_noi (year, month),
  CHECK (month >= 1 AND month <= 12),
  CHECK (year >= 2000 AND year <= 2100),
  CHECK (noi_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remove noi_amount column from monthly_targets table if it exists
ALTER TABLE monthly_targets DROP COLUMN IF EXISTS noi_amount;

-- Ensure unique constraint on monthly_targets is correct
ALTER TABLE monthly_targets DROP INDEX IF EXISTS unique_department_month_year;
ALTER TABLE monthly_targets ADD UNIQUE KEY unique_department_month_year (department_id, year, month);
