const db = require('../config/db');

// GET /api/seller/products
const getMyProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name,
        COALESCE(AVG(r.rating),0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(SUM(oi.quantity),0) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON r.product_id = p.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE p.seller_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// POST /api/seller/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id, is_featured = 0 } = req.body;
    if (!name || !price || !category_id) return res.status(400).json({ error: 'Name, price and category are required' });
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, image_url, category_id, seller_id, is_featured) VALUES (?,?,?,?,?,?,?,?)',
      [name, description || '', price, stock || 0, image_url || '', category_id, req.user.id, is_featured]
    );
    await db.query('INSERT INTO price_history (product_id, price) VALUES (?, ?)', [result.insertId, price]);
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// PUT /api/seller/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id, is_featured, is_active } = req.body;
    const [rows] = await db.query('SELECT id, price FROM products WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found or not yours' });
    if (price && parseFloat(price) !== parseFloat(rows[0].price)) {
      await db.query('INSERT INTO price_history (product_id, price) VALUES (?, ?)', [req.params.id, price]);
    }
    await db.query(`
      UPDATE products SET
        name = COALESCE(?, name), description = COALESCE(?, description),
        price = COALESCE(?, price), stock = COALESCE(?, stock),
        image_url = COALESCE(?, image_url), category_id = COALESCE(?, category_id),
        is_featured = COALESCE(?, is_featured), is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, description, price, stock, image_url, category_id, is_featured, is_active, req.params.id]);
    res.json({ message: 'Product updated' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// DELETE /api/seller/products/:id
const deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM products WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found or not yours' });
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product removed' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// GET /api/seller/orders — with items breakdown
const getSellerOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT o.id, o.status, o.created_at, u.name as customer_name,
        SUM(oi.quantity * oi.price) as seller_revenue,
        JSON_ARRAYAGG(JSON_OBJECT(
          'product_id', p.id, 'product_name', p.name,
          'image_url', p.image_url, 'quantity', oi.quantity, 'price', oi.price
        )) as items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN users u ON u.id = o.user_id
      WHERE p.seller_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `, [req.user.id]);

    const parsed = rows.map(r => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/seller/stats
const getStats = async (req, res) => {
  try {
    const [[{ total_products }]] = await db.query(
      'SELECT COUNT(*) as total_products FROM products WHERE seller_id = ? AND is_active = 1', [req.user.id]);
    const [[{ total_revenue }]] = await db.query(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
      FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.seller_id = ?`, [req.user.id]);
    const [[{ total_orders }]] = await db.query(`
      SELECT COUNT(DISTINCT o.id) as total_orders
      FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
      WHERE p.seller_id = ?`, [req.user.id]);
    const [[{ low_stock }]] = await db.query(
      'SELECT COUNT(*) as low_stock FROM products WHERE seller_id = ? AND stock <= 5 AND is_active = 1', [req.user.id]);
    res.json({ total_products, total_revenue, total_orders, low_stock });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// GET /api/seller/analytics — comprehensive real data
const getAnalytics = async (req, res) => {
  try {
    const sid = req.user.id;

    // Daily revenue last 30 days
    const [dailyRevenue] = await db.query(`
      SELECT DATE(o.created_at) as date,
             COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
             COUNT(DISTINCT o.id) as order_count
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE p.seller_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `, [sid]);

    // Top 5 products by units sold
    const [topProducts] = await db.query(`
      SELECT p.name, p.image_url, p.id, p.stock, p.price,
             COALESCE(SUM(oi.quantity), 0) as units_sold,
             COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.seller_id = ? AND p.is_active = 1
      GROUP BY p.id ORDER BY units_sold DESC LIMIT 5
    `, [sid]);

    // This month vs last month
    const [[thisMonth]] = await db.query(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
             COUNT(DISTINCT o.id) as orders
      FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
      WHERE p.seller_id = ? AND MONTH(o.created_at)=MONTH(NOW()) AND YEAR(o.created_at)=YEAR(NOW())
    `, [sid]);

    const [[lastMonth]] = await db.query(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
             COUNT(DISTINCT o.id) as orders
      FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
      WHERE p.seller_id = ?
        AND MONTH(o.created_at)=MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND YEAR(o.created_at)=YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    `, [sid]);

    // Revenue by category
    const [revenueByCategory] = await db.query(`
      SELECT c.name as category, COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
             COALESCE(SUM(oi.quantity), 0) as units
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE p.seller_id = ? AND p.is_active = 1
      GROUP BY c.id ORDER BY revenue DESC
    `, [sid]);

    // Order status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT o.status, COUNT(DISTINCT o.id) as count
      FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
      WHERE p.seller_id = ?
      GROUP BY o.status
    `, [sid]);

    // Average order value
    const [[aov]] = await db.query(`
      SELECT COALESCE(AVG(sub.rev), 0) as avg_order_value
      FROM (
        SELECT o.id, SUM(oi.quantity * oi.price) as rev
        FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
        WHERE p.seller_id = ? GROUP BY o.id
      ) sub
    `, [sid]);

    // Recent reviews on seller's products
    const [recentReviews] = await db.query(`
      SELECT r.rating, r.comment, r.created_at, u.name as reviewer,
             p.name as product_name, p.id as product_id
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN products p ON p.id = r.product_id
      WHERE p.seller_id = ?
      ORDER BY r.created_at DESC LIMIT 5
    `, [sid]);

    // Overall avg rating across all products
    const [[ratingRow]] = await db.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as total_reviews
      FROM reviews r JOIN products p ON p.id = r.product_id WHERE p.seller_id = ?
    `, [sid]);

    // Stock health — products sorted by stock asc (most urgent first)
    const [stockHealth] = await db.query(`
      SELECT id, name, stock, image_url FROM products
      WHERE seller_id = ? AND is_active = 1
      ORDER BY stock ASC LIMIT 8
    `, [sid]);

    res.json({
      dailyRevenue, topProducts,
      thisMonth: thisMonth.revenue, thisMonthOrders: thisMonth.orders,
      lastMonth: lastMonth.revenue, lastMonthOrders: lastMonth.orders,
      revenueByCategory, statusBreakdown,
      avgOrderValue: aov.avg_order_value,
      recentReviews, avgRating: ratingRow.avg_rating,
      totalReviews: ratingRow.total_reviews, stockHealth
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct, getSellerOrders, getStats, getAnalytics };
