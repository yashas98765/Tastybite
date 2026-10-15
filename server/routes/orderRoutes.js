const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  advanceOrderStage,
  downloadInvoicePDF,
  cancelOrder,
  getWhatsAppShareDetails
} = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalProtect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoicePDF);
router.get('/:id/whatsapp-share', protect, getWhatsAppShareDetails);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/advance-stage', optionalProtect, advanceOrderStage);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
