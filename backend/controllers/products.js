const db = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, u.name as seller_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(ca.count, 0) as cart_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON r.product_id = p.id
      LEFT JOIN cart_activity ca ON ca.product_id = p.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category) { query += ' AND c.slug = ?'; params.push(category); }
    if (search) { query += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' GROUP BY p.id';
    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
    else if (sort === 'rating') query += ' ORDER BY avg_rating DESC';
    else query += ' ORDER BY p.created_at DESC';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(query, params);
    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, u.name as seller_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(ca.count, 0) as cart_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON r.product_id = p.id
      LEFT JOIN cart_activity ca ON ca.product_id = p.id
      WHERE p.id = ? AND p.is_active = 1
      GROUP BY p.id
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const [reviews] = await db.query(`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10
    `, [req.params.id]);

    const [priceHistory] = await db.query(`
      SELECT price, recorded_at FROM price_history
      WHERE product_id = ? ORDER BY recorded_at ASC
    `, [req.params.id]);

    res.json({ ...rows[0], reviews, price_history: priceHistory });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getFeatured = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, u.name as seller_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(ca.count, 0) as cart_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON r.product_id = p.id
      LEFT JOIN cart_activity ca ON ca.product_id = p.id
      WHERE p.is_featured = 1 AND p.is_active = 1
      GROUP BY p.id LIMIT 8
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Ping cart activity (called from frontend when item is added to cart)
const pingCartActivity = async (req, res) => {
  try {
    const { product_id, action } = req.body; // action: 'add' | 'remove'
    if (action === 'add') {
      await db.query(`
        INSERT INTO cart_activity (product_id, count) VALUES (?, 1)
        ON DUPLICATE KEY UPDATE count = count + 1
      `, [product_id]);
    } else {
      await db.query(`
        UPDATE cart_activity SET count = GREATEST(count - 1, 0) WHERE product_id = ?
      `, [product_id]);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProducts, getProduct, getCategories, getFeatured, pingCartActivity };
