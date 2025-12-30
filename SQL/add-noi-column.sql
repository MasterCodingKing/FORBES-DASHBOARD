-- ============================================
-- ADD NOI COLUMN TO MONTHLY TARGETS
-- ============================================
-- Description: Adds noi_amount column to monthly_targets table for
-- storing manually entered Net Operating Income values per month
-- ============================================

USE `dashboard_db`;

-- Check if column exists before adding (prevents errors if running multiple times)
ALTER TABLE `monthly_targets`
ADD COLUMN IF NOT EXISTS `noi_amount` DECIMAL(20, 2) DEFAULT 0 COMMENT 'Monthly Net Operating Income (manually entered)' AFTER `target_amount`;

-- Add constraint to ensure noi_amount is non-negative
-- Note: Some MySQL versions may not support named constraints in ALTER TABLE
-- If this fails, the constraint can be added manually or skipped
ALTER TABLE `monthly_targets`
ADD CONSTRAINT `chk_noi_amount` CHECK (`noi_amount` >= 0);

-- Verify the column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'monthly_targets' AND COLUMN_NAME = 'noi_amount'
AND TABLE_SCHEMA = 'dashboard_db';


-- End of Script
        