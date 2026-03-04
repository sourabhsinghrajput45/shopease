const db = require('../config/db');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { product_id } = req.params;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const [existing] = await db.query('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing.length) return res.status(400).json({ error: 'You already reviewed this product' });

    await db.query('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, product_id, rating, comment || '']);

    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addReview };
