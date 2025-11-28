-- ============================================
-- FORBES DASHBOARD - DATABASE SCHEMA
-- ============================================

ALTER TABLE `departments`
ADD COLUMN `target` FLOAT(11,2) DEFAULT NULL COMMENT 'User department/service';

-- ============================================
-- END OF FILE
-- ============================================