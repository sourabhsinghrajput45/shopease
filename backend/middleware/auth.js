const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const sellerOnly = (req, res, next) => {
  if (req.user?.role !== 'seller') return res.status(403).json({ error: 'Sellers only' });
  next();
};

module.exports = { auth, sellerOnly };
