-- Initialize departments table with data
-- This script will be automatically executed when Docker container starts

-- Create departments table if not exists
CREATE TABLE IF NOT EXISTS `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert departments data (ignore if already exists)
INSERT IGNORE INTO `departments` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
    (1, 'Field Credit Investigation ', 'Banking account management and financial services', '2025-09-04 08:02:12', '2025-09-04 08:02:12'),
    (2, 'Tele Credit Investigation', 'Telecommunications and credit investigation services', '2025-09-04 08:02:12', '2025-09-04 08:02:12'),
    (3, 'Business Reports', 'Comprehensive business reporting and analytics', '2025-09-04 08:02:12', '2025-09-04 08:02:12'),
    (4, 'Appraisals', 'Property and asset appraisal services', '2025-09-04 08:02:12', '2025-09-04 08:02:12'),
    (5, 'Negative Records', 'Credit and negative record monitoring services', '2025-09-04 08:02:13', '2025-09-04 08:02:13'),
    (6, 'Foreign', 'Foreign exchange and international services', '2025-09-04 08:02:13', '2025-09-04 08:02:13'),
    (7, 'Collection', 'Debt collection and recovery services', '2025-09-04 08:02:13', '2025-09-04 08:02:13'),
    (8, 'Marketing', 'Marketing and promotional services', '2025-09-04 08:02:13', '2025-09-04 08:02:13'),
    (9, 'Financial Check', 'Financial verification and credit check services', '2025-09-05 02:19:30', '2025-09-05 02:19:32'),
    (10, 'Foreign Exchange Gain', 'Foreign exchange gain and profit optimization services', '2025-09-05 02:19:52', '2025-09-05 02:19:52');
