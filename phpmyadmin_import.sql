SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `warehouse_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `warehouse_db`;

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('administrator','view_only') NOT NULL DEFAULT 'view_only',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `devices`
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `status` enum('In Stock','Low Stock','Out of Stock') NOT NULL DEFAULT 'In Stock',
  `condition` enum('Normal','Rusak') NOT NULL DEFAULT 'Normal',
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_devices_category` (`category_id`),
  KEY `idx_devices_status` (`status`),
  KEY `idx_devices_condition` (`condition`),
  KEY `idx_devices_category` (`category_id`),
  CONSTRAINT `fk_devices_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `device_instances`
DROP TABLE IF EXISTS `device_instances`;
CREATE TABLE `device_instances` (
  `registration_number` varchar(50) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `condition` enum('Normal','Rusak') NOT NULL DEFAULT 'Normal',
  `status` enum('In Stock','Deployed') NOT NULL DEFAULT 'In Stock',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_number`),
  KEY `fk_instances_device` (`device_id`),
  KEY `idx_instances_status` (`status`),
  KEY `idx_instances_condition` (`condition`),
  CONSTRAINT `fk_instances_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `transactions`
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` varchar(50) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `type` enum('in','out') NOT NULL,
  `quantity` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `destination` varchar(200) DEFAULT NULL,
  `recipient` varchar(100) DEFAULT NULL,
  `source` varchar(200) DEFAULT NULL,
  `sender` varchar(100) DEFAULT NULL,
  `registration_numbers` text DEFAULT NULL, -- Changed from JSON to TEXT for better compatibility
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_transactions_device` (`device_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_transaction_type` (`type`),
  CONSTRAINT `fk_transactions_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'admin', 'admin@warehouse.com', MD5('P4ssword'), 'administrator'),
(2, 'view', 'view@warehouse.com', MD5('P4ssword'), 'view_only')

-- Dumping data for table `categories`
INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Router'),
(2, 'Switch'),
(3, 'Access Point'),
(4, 'Firewall'),
(5, 'Cable'),
(6, 'Server'),
(7, 'Modem'),
(8, 'Hub'),
(9, 'Network Card'),
(10, 'Patch Panel');

-- Dumping data for table `devices`
INSERT INTO `devices` (`id`, `name`, `category_id`, `brand`, `quantity`, `status`, `condition`, `description`) VALUES
('DEV001', 'Cisco Router 2901', 1, 'Cisco', 15, 'In Stock', 'Normal', 'Enterprise-grade router with advanced security features'),
('DEV002', 'TP-Link Archer C7', 3, 'TP-Link', 8, 'Low Stock', 'Normal', 'Dual-band wireless router for small to medium networks'),
('DEV003', 'Netgear GS108', 2, 'Netgear', 25, 'In Stock', 'Normal', '8-port Gigabit Ethernet switch'),
('DEV004', 'Ubiquiti UniFi AP', 3, 'Ubiquiti', 12, 'In Stock', 'Normal', 'Professional wireless access point'),
('DEV005', 'SonicWall TZ370', 4, 'SonicWall', 3, 'Low Stock', 'Normal', 'Next-generation firewall for small business'),
('DEV006', 'Cat6 Cable 305m', 5, 'Panduit', 50, 'In Stock', 'Normal', 'Category 6 UTP cable roll'),
('DEV007', 'Dell PowerEdge R740', 6, 'Dell', 2, 'Low Stock', 'Normal', 'Rack server for enterprise applications'),
('DEV008', 'Linksys WRT3200ACM', 1, 'Linksys', 0, 'Out of Stock', 'Rusak', 'Tri-stream router - needs repair'),
('DEV009', 'HP ProCurve 2530', 2, 'HP', 18, 'In Stock', 'Normal', '24-port managed switch'),
('DEV010', 'Motorola MB7621', 7, 'Motorola', 6, 'Low Stock', 'Normal', 'DOCSIS 3.0 cable modem'),
('DEV011', 'MikroTik hEX S', 1, 'MikroTik', 20, 'In Stock', 'Normal', '5-port Gigabit Ethernet router'),
('DEV012', 'D-Link DGS-1016A', 2, 'D-Link', 14, 'In Stock', 'Normal', '16-port Gigabit desktop switch'),
('DEV013', 'Aruba AP-315', 3, 'Aruba', 9, 'Low Stock', 'Normal', 'Wi-Fi 6 access point'),
('DEV014', 'Fortinet FortiGate 60F', 4, 'Fortinet', 5, 'Low Stock', 'Normal', 'Next-generation firewall'),
('DEV015', 'Cat5e Cable 305m', 5, 'Belden', 30, 'In Stock', 'Normal', 'Category 5e UTP cable roll');

-- Dumping data for table `device_instances`
INSERT INTO `device_instances` (`registration_number`, `device_id`, `condition`, `status`) VALUES
('REG001', 'DEV001', 'Normal', 'In Stock'),
('REG002', 'DEV001', 'Normal', 'Deployed'),
('REG003', 'DEV001', 'Normal', 'In Stock'),
('REG004', 'DEV002', 'Normal', 'In Stock'),
('REG005', 'DEV002', 'Normal', 'Deployed'),
('REG006', 'DEV003', 'Normal', 'In Stock'),
('REG007', 'DEV004', 'Normal', 'Deployed'),
('REG008', 'DEV005', 'Normal', 'In Stock'),
('REG009', 'DEV007', 'Normal', 'Deployed'),
('REG010', 'DEV008', 'Rusak', 'In Stock'),
('REG011', 'DEV009', 'Normal', 'In Stock'),
('REG012', 'DEV010', 'Normal', 'In Stock'),
('REG013', 'DEV011', 'Normal', 'Deployed'),
('REG014', 'DEV012', 'Normal', 'In Stock'),
('REG015', 'DEV013', 'Normal', 'In Stock');

-- Dumping data for table `transactions`
INSERT INTO `transactions` (`id`, `device_id`, `type`, `quantity`, `transaction_date`, `user_name`, `destination`, `recipient`, `source`, `sender`, `registration_numbers`) VALUES
('TXN001', 'DEV001', 'out', 2, '2025-09-05', 'Administrator', 'Branch Office Jakarta', 'IT Team Jakarta', NULL, NULL, NULL),
('TXN002', 'DEV002', 'in', 10, '2025-09-04', 'Staff Gudang', NULL, NULL, 'Supplier ABC', 'Delivery Team', NULL),
('TXN003', 'DEV003', 'out', 5, '2025-09-03', 'John Doe', 'Data Center', 'Network Admin', NULL, NULL, NULL),
('TXN004', 'DEV004', 'in', 15, '2025-09-02', 'Administrator', NULL, NULL, 'Ubiquiti Store', 'Sales Rep', NULL),
('TXN005', 'DEV005', 'out', 1, '2025-09-01', 'Jane Smith', 'Security Office', 'Security Team', NULL, NULL, NULL),
('TXN006', 'DEV006', 'in', 100, '2025-08-31', 'Staff Gudang', NULL, NULL, 'Cable Supplier', 'Logistics', NULL),
('TXN007', 'DEV007', 'out', 1, '2025-08-30', 'Administrator', 'Server Room', 'System Admin', NULL, NULL, NULL),
('TXN008', 'DEV009', 'in', 20, '2025-08-29', 'John Doe', NULL, NULL, 'HP Distributor', 'Account Manager', NULL),
('TXN009', 'DEV011', 'in', 25, '2025-08-28', 'Ahmad Rizki', NULL, NULL, 'MikroTik Distributor', 'Sales Team', NULL),
('TXN010', 'DEV012', 'out', 6, '2025-08-27', 'Siti Nurhaliza', 'Branch Office Surabaya', 'IT Support', NULL, NULL, NULL),
('TXN011', 'DEV013', 'in', 12, '2025-08-26', 'Administrator', NULL, NULL, 'Aruba Partner', 'Technical Sales', NULL),
('TXN012', 'DEV014', 'out', 2, '2025-08-25', 'John Doe', 'Main Office', 'Security Admin', NULL, NULL, NULL),
('TXN013', 'DEV015', 'in', 50, '2025-08-24', 'Staff Gudang', NULL, NULL, 'Belden Supplier', 'Logistics Team', NULL),
('TXN014', 'DEV001', 'out', 3, '2025-08-23', 'Jane Smith', 'Remote Office', 'Network Engineer', NULL, NULL, NULL),
('TXN015', 'DEV003', 'in', 15, '2025-08-22', 'Ahmad Rizki', NULL, NULL, 'Netgear Store', 'Account Rep', NULL);

-- Create views
DROP VIEW IF EXISTS `device_summary`;
CREATE VIEW `device_summary` AS
SELECT 
    d.id,
    d.name,
    c.name as category_name,
    d.brand,
    d.quantity,
    d.status,
    d.condition,
    COUNT(di.registration_number) as instance_count,
    d.description,
    d.created_at,
    d.updated_at
FROM devices d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN device_instances di ON d.id = di.device_id
GROUP BY d.id, d.name, c.name, d.brand, d.quantity, d.status, d.condition, d.description, d.created_at, d.updated_at;

DROP VIEW IF EXISTS `transaction_summary`;
CREATE VIEW `transaction_summary` AS
SELECT 
    t.id,
    t.device_id,
    d.name as device_name,
    c.name as category_name,
    d.brand as device_brand,
    t.type,
    t.quantity,
    t.transaction_date,
    t.user_name,
    COALESCE(t.destination, t.source) as location,
    COALESCE(t.recipient, t.sender) as contact_person,
    t.created_at
FROM transactions t
LEFT JOIN devices d ON t.device_id = d.id
LEFT JOIN categories c ON d.category_id = c.id
ORDER BY t.transaction_date DESC, t.created_at DESC;

DROP VIEW IF EXISTS `stock_status_report`;
CREATE VIEW `stock_status_report` AS
SELECT 
    c.name as category,
    COUNT(d.id) as total_devices,
    SUM(d.quantity) as total_quantity,
    SUM(CASE WHEN d.status = 'In Stock' THEN d.quantity ELSE 0 END) as in_stock_qty,
    SUM(CASE WHEN d.status = 'Low Stock' THEN d.quantity ELSE 0 END) as low_stock_qty,
    SUM(CASE WHEN d.status = 'Out of Stock' THEN d.quantity ELSE 0 END) as out_stock_qty,
    SUM(CASE WHEN d.condition = 'Normal' THEN d.quantity ELSE 0 END) as normal_condition_qty,
    SUM(CASE WHEN d.condition = 'Rusak' THEN d.quantity ELSE 0 END) as damaged_condition_qty
FROM categories c
LEFT JOIN devices d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

DROP VIEW IF EXISTS `monthly_transaction_report`;
CREATE VIEW `monthly_transaction_report` AS
SELECT 
    DATE_FORMAT(t.transaction_date, '%Y-%m') as month_year,
    t.type,
    COUNT(t.id) as transaction_count,
    SUM(t.quantity) as total_quantity,
    COUNT(DISTINCT t.device_id) as unique_devices,
    COUNT(DISTINCT t.user_name) as unique_users
FROM transactions t
GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m'), t.type
ORDER BY month_year DESC, t.type;

-- Drop existing procedures
DROP PROCEDURE IF EXISTS `GetLowStockDevices`;
DROP PROCEDURE IF EXISTS `GetDevicesByCondition`;
DROP PROCEDURE IF EXISTS `GetTransactionsByDateRange`;
DROP PROCEDURE IF EXISTS `GetDashboardStats`;
DROP PROCEDURE IF EXISTS `GetMonthlyStats`;

DELIMITER //

-- Create procedures
CREATE PROCEDURE `GetLowStockDevices`()
BEGIN
    SELECT 
        d.*,
        c.name as category_name 
    FROM devices d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE d.status IN ('Low Stock', 'Out of Stock')
    ORDER BY 
        CASE d.status 
            WHEN 'Out of Stock' THEN 1 
            WHEN 'Low Stock' THEN 2 
            ELSE 3 
        END,
        d.quantity ASC,
        d.name;
END //

CREATE PROCEDURE `GetDevicesByCondition`(IN device_condition VARCHAR(10))
BEGIN
    SELECT 
        d.*,
        c.name as category_name 
    FROM devices d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE d.condition = device_condition
    ORDER BY d.name;
END //

CREATE PROCEDURE `GetTransactionsByDateRange`(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        t.*,
        d.name as device_name,
        c.name as category_name,
        d.brand as device_brand
    FROM transactions t
    LEFT JOIN devices d ON t.device_id = d.id
    LEFT JOIN categories c ON d.category_id = c.id
    WHERE t.transaction_date BETWEEN start_date AND end_date
    ORDER BY t.transaction_date DESC, t.created_at DESC;
END //

CREATE PROCEDURE `GetDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM devices) as total_devices,
        (SELECT SUM(quantity) FROM devices) as total_quantity,
        (SELECT COUNT(*) FROM devices WHERE status = 'Low Stock') as low_stock_count,
        (SELECT COUNT(*) FROM devices WHERE status = 'Out of Stock') as out_stock_count,
        (SELECT COUNT(*) FROM devices WHERE `condition` = 'Rusak') as damaged_count,
        (SELECT COUNT(*) FROM transactions WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_transactions,
        (SELECT COUNT(*) FROM transactions WHERE type = 'in' AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_in_transactions,
        (SELECT COUNT(*) FROM transactions WHERE type = 'out' AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_out_transactions,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM categories) as total_categories;
END //

CREATE PROCEDURE `GetMonthlyStats`(IN target_month DATE)
BEGIN
    SELECT 
        DATE_FORMAT(target_month, '%Y-%m') as month,
        (SELECT COUNT(*) FROM transactions WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(target_month, '%Y-%m')) as total_transactions,
        (SELECT COUNT(*) FROM transactions WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(target_month, '%Y-%m') AND type = 'in') as in_transactions,
        (SELECT COUNT(*) FROM transactions WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(target_month, '%Y-%m') AND type = 'out') as out_transactions,
        (SELECT SUM(quantity) FROM transactions WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(target_month, '%Y-%m') AND type = 'in') as total_in_quantity,
        (SELECT SUM(quantity) FROM transactions WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(target_month, '%Y-%m') AND type = 'out') as total_out_quantity;
END //

DELIMITER ;

-- Create indexes
CREATE INDEX idx_devices_name ON devices(name);
CREATE INDEX idx_devices_brand ON devices(brand);
CREATE INDEX idx_transactions_user ON transactions(user_name);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_device_instances_device_status ON device_instances(device_id, status);

-- Drop existing triggers
DROP TRIGGER IF EXISTS `update_device_status_after_transaction`;
DROP TRIGGER IF EXISTS `validate_transaction_quantity`;
DROP TRIGGER IF EXISTS `update_device_quantity_after_transaction`;

DELIMITER //

-- Create triggers
CREATE TRIGGER `update_device_quantity_after_transaction`
AFTER INSERT ON `transactions`
FOR EACH ROW
BEGIN
    IF NEW.type = 'in' THEN
        UPDATE devices 
        SET quantity = quantity + NEW.quantity
        WHERE id = NEW.device_id;
    ELSE
        UPDATE devices 
        SET quantity = quantity - NEW.quantity
        WHERE id = NEW.device_id;
    END IF;
END //

CREATE TRIGGER `update_device_status_after_transaction`
AFTER UPDATE ON `devices`
FOR EACH ROW
BEGIN
    DECLARE new_status VARCHAR(20);
    
    IF NEW.quantity = 0 THEN
        SET new_status = 'Out of Stock';
    ELSEIF NEW.quantity <= 10 THEN
        SET new_status = 'Low Stock';
    ELSE
        SET new_status = 'In Stock';
    END IF;
    
    IF NEW.status != new_status THEN
        UPDATE devices SET status = new_status WHERE id = NEW.id;
    END IF;
END //

CREATE TRIGGER `validate_transaction_quantity`
BEFORE INSERT ON `transactions`
FOR EACH ROW
BEGIN
    DECLARE current_qty INT;
    
    IF NEW.type = 'out' THEN
        SELECT quantity INTO current_qty FROM devices WHERE id = NEW.device_id;
        
        IF current_qty < NEW.quantity THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Insufficient stock for outbound transaction';
        END IF;
    END IF;
END //

DELIMITER ;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
