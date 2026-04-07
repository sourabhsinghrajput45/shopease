const express = require('express');
const router = express.Router();
const { getMyProducts, createProduct, updateProduct, deleteProduct, getSellerOrders, getStats, getAnalytics } = require('../controllers/seller');
const { auth, sellerOnly } = require('../middleware/auth');

router.use(auth, sellerOnly);
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/products', getMyProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getSellerOrders);

module.exports = router;
