-- Create Monthly Projections table for manually inputted projection data
CREATE TABLE IF NOT EXISTS monthly_projections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  avg_monthly DECIMAL(20, 2) NOT NULL DEFAULT 0,
  monthly_target DECIMAL(20, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_projection_dept_year_month (department_id, year, month),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CHECK (month >= 1 AND month <= 12),
  CHECK (year >= 2000 AND year <= 2100),
  CHECK (avg_monthly >= 0),
  CHECK (monthly_target >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for faster lookups
CREATE INDEX idx_projections_year_month ON monthly_projections(year, month);
CREATE INDEX idx_projections_department ON monthly_projections(department_id);
