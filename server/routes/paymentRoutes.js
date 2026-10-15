const express = require('express');
const router = express.Router();
const {
  processPayment,
  downloadPaymentReceipt,
  getMyPayments,
  refundPayment,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/process', protect, processPayment);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/:id/receipt', protect, downloadPaymentReceipt);
router.put('/:id/refund', protect, adminOnly, refundPayment);

module.exports = router;

