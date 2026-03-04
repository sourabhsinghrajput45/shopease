-- =============================================
-- ShopEase Database Setup
-- Run this file in MySQL to initialize the DB
-- =============================================

-- 1. Create and select database
CREATE DATABASE IF NOT EXISTS shopease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopease;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
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
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
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

-- 3. Insert categories
INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Books', 'books'),
  ('Home & Kitchen', 'home-kitchen'),
  ('Sports', 'sports'),
  ('Beauty', 'beauty');

-- 4. Insert products
INSERT INTO products (name, description, price, stock, category_id, is_featured, image_url) VALUES
  -- Electronics
  ('Wireless Bluetooth Earbuds', 'True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance. Compatible with all Bluetooth devices.', 1999, 50, 1, 1, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600'),
  ('Mechanical Keyboard', 'Compact 75% mechanical keyboard with tactile brown switches, RGB backlighting, and USB-C connectivity. Perfect for typing and gaming.', 3499, 30, 1, 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'),
  ('USB-C Hub 7-in-1', 'Expand your laptop with 4K HDMI, 2x USB-A, USB-C PD charging, SD card reader, and Gigabit Ethernet. Plug and play, no drivers needed.', 1499, 75, 1, 0, 'https://images.unsplash.com/photo-1625480860249-be231806f273?w=600'),
  ('Phone Stand Adjustable', 'Aluminum desk stand for phones and tablets. Adjustable angle, foldable design, compatible with all devices.', 699, 100, 1, 0, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'),
  ('Smart Watch Fitness Tracker', 'Track your steps, heart rate, sleep, and more. 7-day battery life, waterproof, with customizable watch faces.', 4999, 25, 1, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),

  -- Clothing
  ('Classic White Linen Shirt', 'Relaxed-fit linen shirt, perfect for warm weather. Available in sizes S to XXL. Machine washable.', 1299, 80, 2, 1, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'),
  ('Slim Fit Chinos', 'Versatile stretch chinos for everyday wear. Mid-rise, straight leg. Available in beige, navy, and olive.', 1799, 60, 2, 0, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600'),
  ('Merino Wool Crew Neck Sweater', 'Soft 100% merino wool sweater. Lightweight, breathable, and warm. Available in 6 colours.', 2499, 40, 2, 1, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'),
  ('Canvas Tote Bag', 'Sturdy everyday tote made from 100% organic cotton canvas. Large interior pocket. Machine washable.', 599, 120, 2, 0, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600'),

  -- Books
  ('Atomic Habits', 'James Clear''s bestseller on building good habits and breaking bad ones. Practical, science-backed strategies for everyday improvement.', 449, 200, 3, 1, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'),
  ('Deep Work by Cal Newport', 'Rules for focused success in a distracted world. Learn how to produce your best work by working deeply.', 399, 150, 3, 0, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'),
  ('The Design of Everyday Things', 'Don Norman''s classic on user-centred design. Essential reading for designers, engineers, and curious minds.', 549, 80, 3, 1, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600'),

  -- Home & Kitchen
  ('Ceramic Pour-Over Coffee Set', 'Handcrafted ceramic dripper with matching mug. Includes paper filters. Makes 1-2 cups of perfect pour-over coffee.', 1299, 45, 4, 1, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'),
  ('Bamboo Cutting Board Set', 'Set of 3 bamboo cutting boards in different sizes. Eco-friendly, easy to clean, with juice grooves and non-slip feet.', 899, 60, 4, 0, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'),
  ('Scented Soy Candle', 'Hand-poured soy wax candle with wooden wick. Long burn time of 45+ hours. Available in Sandalwood, Vanilla, and Cedarwood.', 799, 90, 4, 0, 'https://images.unsplash.com/photo-1603905900688-8c6a4f368a79?w=600'),

  -- Sports
  ('Resistance Bands Set', 'Set of 5 resistance bands in different strengths. Ideal for home workouts, stretching, and rehabilitation. Includes carry bag.', 699, 110, 5, 0, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600'),
  ('Yoga Mat Premium', 'Extra thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material, includes carrying strap.', 1499, 55, 5, 1, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'),

  -- Beauty
  ('Vitamin C Face Serum', 'Brightening 20% vitamin C serum with hyaluronic acid and ferulic acid. Reduces dark spots, evens skin tone. 30ml.', 1199, 70, 6, 1, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'),
  ('Natural Lip Balm Set', 'Set of 4 organic lip balms in different flavours: Vanilla, Mint, Honey, and Coconut. Free from parabens and artificial colours.', 349, 150, 6, 0, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600');

-- 5. Insert a demo user (password: demo1234)
INSERT INTO users (name, email, password) VALUES
  ('Demo User', 'demo@shopease.com', '$2a$10$XKDx2cGdAMGDMLzWVZlVROoUSRaEcRmNcFTLFEApCHoNF8J4hM6sm');

-- 6. Insert some sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  (1, 1, 5, 'Fantastic sound quality for the price. The noise cancellation works really well on my commute.'),
  (1, 2, 4, 'Great keyboard. The switches feel satisfying and the build quality is solid. Took off one star for the software.'),
  (1, 10, 5, 'This book genuinely changed how I approach building habits. Highly recommend.'),
  (1, 13, 5, 'Makes a perfect cup of coffee every morning. The ceramic quality is excellent.'),
  (1, 17, 4, 'Good thickness and grip. Perfect for my daily yoga practice.');

-- Done!
SELECT 'ShopEase database setup complete!' AS message;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_categories FROM categories;
