-- =============================================
-- ShopEase Database Setup (v2 — RBAC + Price History)
-- =============================================

CREATE DATABASE IF NOT EXISTS shopease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopease;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer','seller') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  category_id INT,
  seller_id INT,
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS cart_activity (
  product_id INT NOT NULL,
  count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address JSON,
  payment_method VARCHAR(50) DEFAULT 'card',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),('Clothing', 'clothing'),('Books', 'books'),
  ('Home & Kitchen', 'home-kitchen'),('Sports', 'sports'),('Beauty', 'beauty');

-- Demo accounts (password for both: demo1234)
INSERT INTO users (name, email, password, role) VALUES
  ('Demo Customer', 'customer@shopease.com', '$2a$10$XKDx2cGdAMGDMLzWVZlVROoUSRaEcRmNcFTLFEApCHoNF8J4hM6sm', 'customer'),
  ('Demo Seller',   'seller@shopease.com',   '$2a$10$XKDx2cGdAMGDMLzWVZlVROoUSRaEcRmNcFTLFEApCHoNF8J4hM6sm', 'seller');

INSERT INTO products (name, description, price, stock, category_id, seller_id, is_featured, image_url) VALUES
  ('Wireless Bluetooth Earbuds','True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance.',1999,50,1,2,1,'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600'),
  ('Mechanical Keyboard','Compact 75% mechanical keyboard with tactile brown switches, RGB backlighting, and USB-C connectivity.',3499,30,1,2,1,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'),
  ('USB-C Hub 7-in-1','Expand your laptop with 4K HDMI, 2x USB-A, USB-C PD charging, SD card reader, and Gigabit Ethernet.',1499,75,1,2,0,'https://images.unsplash.com/photo-1625480860249-be231806f273?w=600'),
  ('Phone Stand Adjustable','Aluminum desk stand for phones and tablets. Adjustable angle, foldable design.',699,100,1,2,0,'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'),
  ('Smart Watch Fitness Tracker','Track your steps, heart rate, sleep, and more. 7-day battery life, waterproof.',4999,25,1,2,1,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),
  ('Classic White Linen Shirt','Relaxed-fit linen shirt, perfect for warm weather. Available in sizes S to XXL.',1299,80,2,2,1,'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'),
  ('Slim Fit Chinos','Versatile stretch chinos for everyday wear. Mid-rise, straight leg.',1799,60,2,2,0,'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600'),
  ('Merino Wool Crew Neck Sweater','Soft 100% merino wool sweater. Lightweight, breathable, and warm.',2499,40,2,2,1,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'),
  ('Canvas Tote Bag','Sturdy everyday tote made from 100% organic cotton canvas.',599,120,2,2,0,'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600'),
  ('Atomic Habits','James Clear''s bestseller on building good habits and breaking bad ones.',449,200,3,2,1,'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'),
  ('Deep Work by Cal Newport','Rules for focused success in a distracted world.',399,150,3,2,0,'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'),
  ('The Design of Everyday Things','Don Norman''s classic on user-centred design.',549,80,3,2,1,'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600'),
  ('Ceramic Pour-Over Coffee Set','Handcrafted ceramic dripper with matching mug. Includes paper filters.',1299,45,4,2,1,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'),
  ('Bamboo Cutting Board Set','Set of 3 bamboo cutting boards. Eco-friendly, easy to clean.',899,60,4,2,0,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'),
  ('Scented Soy Candle','Hand-poured soy wax candle with wooden wick. 45+ hour burn time.',799,90,4,2,0,'https://images.unsplash.com/photo-1603905900688-8c6a4f368a79?w=600'),
  ('Resistance Bands Set','Set of 5 bands in different strengths. Ideal for home workouts.',699,110,5,2,0,'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600'),
  ('Yoga Mat Premium','Extra thick 6mm non-slip yoga mat with alignment lines.',1499,55,5,2,1,'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'),
  ('Vitamin C Face Serum','Brightening 20% vitamin C serum with hyaluronic acid. 30ml.',1199,70,6,2,1,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'),
  ('Natural Lip Balm Set','Set of 4 organic lip balms: Vanilla, Mint, Honey, and Coconut.',349,150,6,2,0,'https://images.unsplash.com/photo-1617897903246-719242758050?w=600');

-- Price history to power the sparkline charts
INSERT INTO price_history (product_id, price, recorded_at) VALUES
  (1,2499,DATE_SUB(NOW(),INTERVAL 90 DAY)),(1,2199,DATE_SUB(NOW(),INTERVAL 60 DAY)),(1,1999,DATE_SUB(NOW(),INTERVAL 30 DAY)),(1,1999,NOW()),
  (2,3999,DATE_SUB(NOW(),INTERVAL 90 DAY)),(2,3799,DATE_SUB(NOW(),INTERVAL 45 DAY)),(2,3499,DATE_SUB(NOW(),INTERVAL 14 DAY)),(2,3499,NOW()),
  (5,5999,DATE_SUB(NOW(),INTERVAL 120 DAY)),(5,5499,DATE_SUB(NOW(),INTERVAL 60 DAY)),(5,4999,DATE_SUB(NOW(),INTERVAL 20 DAY)),(5,4999,NOW()),
  (10,599,DATE_SUB(NOW(),INTERVAL 60 DAY)),(10,499,DATE_SUB(NOW(),INTERVAL 30 DAY)),(10,449,NOW()),
  (13,1599,DATE_SUB(NOW(),INTERVAL 90 DAY)),(13,1399,DATE_SUB(NOW(),INTERVAL 45 DAY)),(13,1299,NOW()),
  (17,1799,DATE_SUB(NOW(),INTERVAL 60 DAY)),(17,1599,DATE_SUB(NOW(),INTERVAL 30 DAY)),(17,1499,NOW()),
  (18,1499,DATE_SUB(NOW(),INTERVAL 90 DAY)),(18,1299,DATE_SUB(NOW(),INTERVAL 30 DAY)),(18,1199,NOW());

INSERT INTO cart_activity (product_id, count) VALUES
  (1,7),(2,3),(5,11),(6,5),(10,8),(13,4),(17,6),(18,9);

INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  (1,1,5,'Fantastic sound quality for the price. The noise cancellation works really well on my commute.'),
  (1,2,4,'Great keyboard. The switches feel satisfying and build quality is solid.'),
  (1,10,5,'This book genuinely changed how I approach building habits. Highly recommend.'),
  (1,13,5,'Makes a perfect cup of coffee every morning. The ceramic quality is excellent.'),
  (1,17,4,'Good thickness and grip. Perfect for my daily yoga practice.');

SELECT 'ShopEase v2 setup complete!' AS message;
