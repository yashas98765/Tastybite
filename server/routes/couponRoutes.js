const express = require('express');
const router = express.Router();
const { validateCoupon, getAllCoupons } = require('../controllers/couponController');

router.get('/', getAllCoupons);
router.post('/validate', validateCoupon);

module.exports = router;
