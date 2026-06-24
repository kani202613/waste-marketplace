-- Database schema for Waste Marketplace
CREATE DATABASE IF NOT EXISTS waste_market;
USE waste_market;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'seller', -- e.g. 'seller', 'collector', 'buyer'
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Waste Items Table
CREATE TABLE IF NOT EXISTS waste_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  approx_weight DECIMAL(10, 2) DEFAULT 0.00,
  base_price DECIMAL(10, 2) DEFAULT 0.00,
  image_url VARCHAR(255) NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'ACCEPTED', 'COMPLETED', 'CLOSED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  waste_item_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (waste_item_id) REFERENCES waste_items(id) ON DELETE CASCADE
);
