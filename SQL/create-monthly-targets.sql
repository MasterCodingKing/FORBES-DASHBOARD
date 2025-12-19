-- ============================================
-- MONTHLY TARGETS TABLE MIGRATION
-- ============================================
-- Description: Creates the monthly_targets table for storing 
-- monthly sales targets per department/service
-- ============================================

USE `dashboard_db`;

-- ============================================
-- TABLE: monthly_targets
-- Description: Stores monthly sales targets for each department
-- ============================================
CREATE TABLE IF NOT EXISTS `monthly_targets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL COMMENT 'Foreign key to departments table',
  `year` INT(4) NOT NULL COMMENT 'Target year (e.g., 2025)',
  `month` INT(2) NOT NULL COMMENT 'Target month (1-12)',
  `target_amount` DECIMAL(20, 2) NOT NULL COMMENT 'Monthly target amount',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_department_month_year` (`department_id`, `year`, `month`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_year_month` (`year`, `month`),
  INDEX `idx_department_year` (`department_id`, `year`),
  CONSTRAINT `fk_monthly_targets_department` 
    FOREIGN KEY (`department_id`) 
    REFERENCES `departments` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `chk_month` CHECK (`month` >= 1 AND `month` <= 12),
  CONSTRAINT `chk_year` CHECK (`year` >= 2000 AND `year` <= 2100),
  CONSTRAINT `chk_target_amount` CHECK (`target_amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Monthly sales targets per department';

-- ============================================
-- MIGRATION: Copy existing department targets to monthly_targets
-- This migrates the current month's target from departments table
-- ============================================
-- INSERT INTO monthly_targets (department_id, year, month, target_amount)
-- SELECT 
--   id as department_id,
--   YEAR(CURRENT_DATE) as year,
--   MONTH(CURRENT_DATE) as month,
--   target as target_amount
-- FROM departments
-- WHERE target IS NOT NULL AND target > 0;
