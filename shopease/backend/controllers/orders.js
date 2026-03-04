const db = require('../config/db');

const createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { items, shipping_address, payment_method = 'card' } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });

    let total = 0;
    for (const item of items) {
      const [rows] = await conn.query('SELECT price, stock FROM products WHERE id = ? AND is_active = 1', [item.product_id]);
      if (!rows.length) throw new Error(`Product ${item.product_id} not found`);
      if (rows[0].stock < item.quantity) throw new Error(`Not enough stock for product ${item.product_id}`);
      total += rows[0].price * item.quantity;
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total, JSON.stringify(shipping_address), payment_method, 'pending']
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [rows] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, rows[0].price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    conn.release();
  }
};

const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
        JSON_ARRAYAGG(JSON_OBJECT(
          'id', oi.id, 'product_id', oi.product_id,
          'product_name', p.name, 'product_image', p.image_url,
          'quantity', oi.quantity, 'price', oi.price
        )) as items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.* FROM orders o WHERE o.id = ? AND o.user_id = ?
    `, [req.params.id, req.user.id]);

    if (!orders.length) return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.*, p.name as product_name, p.image_url FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, getOrder };
