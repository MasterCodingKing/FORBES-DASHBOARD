-- Drop existing audit_logs table if it exists
DROP TABLE IF EXISTS `audit_logs`;

-- Create audit_logs table with proper structure
CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `username` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'Action performed (e.g., CREATE, UPDATE, DELETE, LOGIN, LOGOUT)',
  `entity` VARCHAR(50) NOT NULL COMMENT 'Entity affected (e.g., Sale, Expense, User, Department)',
  `entity_id` INT DEFAULT NULL COMMENT 'ID of the affected entity',
  `description` TEXT DEFAULT NULL COMMENT 'Description of the action',
  `old_values` JSON DEFAULT NULL COMMENT 'Previous values before update',
  `new_values` JSON DEFAULT NULL COMMENT 'New values after update/create',
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `audit_logs_user_id` (`user_id`),
  KEY `audit_logs_action` (`action`),
  KEY `audit_logs_entity` (`entity`),
  KEY `audit_logs_created_at` (`createdAt`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
