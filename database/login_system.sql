-- ==========================================
-- LOGIN SYSTEM DATABASE SCRIPT (MySQL)
-- Urdu Comment: Yeh script phpMyAdmin ya MySQL mein database aur table create karne ke liye hai
-- ==========================================

-- Database Create kar rahe hain agar pehle se mojood nahi hai
CREATE DATABASE IF NOT EXISTS `login_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Database select kar rahe hain
USE `login_system`;

-- Products table pehle drop kar rahe hain kyun ke is ka users table se foreign key relation hai
DROP TABLE IF EXISTS `products`;

-- Users Table Delete kar rahe hain agar pehle se mojood ho
DROP TABLE IF EXISTS `users`;

-- Users Table Create kar rahe hain
-- Urdu Comment: Is table mein user ka name, email, hashed password aur creation time save hoga
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Test User Insert kar rahe hain (Password is "Password123!")
-- Urdu Comment: Test karne ke liye demo user add kar rahe hain. Password bcrypt se hashed hai.
INSERT INTO `users` (`name`, `email`, `password`) VALUES
('Ahmed Khan', 'ahmed@example.com', '$2a$10$wN9iL6U/aK7p/QyH4A6bHe0Hk2mQ0WkC8A8qX1n9E2F1.vK9W0e2y')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Products Table Create kar rahe hain
-- Urdu Comment: Har product logged-in seller/user ke sath linked hoga
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(120) NOT NULL,
  `brand` VARCHAR(120) NOT NULL,
  `platform` VARCHAR(80) NOT NULL,
  `genre` VARCHAR(80) NOT NULL,
  `condition` VARCHAR(80) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `status` ENUM('Available', 'Out of Stock', 'Hidden') NOT NULL DEFAULT 'Available',
  `description` TEXT NOT NULL,
  `image` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_user_id` (`user_id`),
  INDEX `idx_products_search` (`name`, `category`, `brand`),
  CONSTRAINT `fk_products_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Urdu Comment: Table structure aur sample data ready hai
