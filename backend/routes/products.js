const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, getFeatured, pingCartActivity } = require('../controllers/products');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.post('/cart-ping', pingCartActivity);
router.get('/:id', getProduct);

module.exports = router;
