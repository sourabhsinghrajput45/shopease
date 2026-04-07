const express = require('express');
const router = express.Router();
const { addReview } = require('../controllers/reviews');
const { auth } = require('../middleware/auth');

router.post('/:product_id', auth, addReview);

module.exports = router;
