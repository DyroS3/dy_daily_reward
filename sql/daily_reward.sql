CREATE TABLE IF NOT EXISTS `daily_rewards` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(60) NOT NULL,
    `last_claim_date` DATE DEFAULT NULL,
    `claimed_days` JSON DEFAULT '[]',
    `current_month` INT DEFAULT 0,
    `current_year` INT DEFAULT 0,
    `streak` INT DEFAULT 0,
    `total_claims` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
