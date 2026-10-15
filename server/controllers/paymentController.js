const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { generatePaymentReceiptPDF } = require('../services/pdfService');
const { sendPaymentReceiptEmail, sendOrderConfirmationEmail } = require('../services/emailService');
const { emitOrderStatusUpdate } = require('../services/socketService');

// Initialize Razorpay instance helper
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TNgbXItY3fibBE';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'osNu1DGCZ6uPlN20qgMvtJv6';
  return new Razorpay({ key_id, key_secret });
};

// @desc    Process order payment (Realistic Sandbox/Test Payment Flow)
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      paymentMethod = 'UPI',
      cardDetails,
      upiDetails,
      bankDetails,
      walletDetails,
      simulateFailure = false
    } = req.body;

    const order = await Order.findById(orderId).populate('user').populate('restaurant');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found'
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid'
      });
    }

    // Generate realistic transaction and payment identifiers
    const timestamp = Date.now().toString().slice(-8);
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    const transactionId = `TXN_TB_${paymentMethod}_${timestamp}${randomHex}`;
    const paymentNumber = `TB-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    if (simulateFailure) {
      // Create failed payment record for testing error handling
      const failedPayment = await Payment.create({
        paymentNumber,
        transactionId,
        order: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod,
        status: 'Failed'
      });

      order.paymentStatus = 'Failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment was declined by bank simulator. Please try an alternate method.',
        payment: failedPayment
      });
    }

    // Success flow
    const payment = await Payment.create({
      paymentNumber,
      transactionId,
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      paymentDetails: {
        cardLastFour: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
        cardNetwork: 'Visa / RuPay',
        upiId: upiDetails?.upiId || 'customer@okaxis',
        bankName: bankDetails?.bankName || 'HDFC Bank',
        walletName: walletDetails?.walletName || 'TastyBite Wallet'
      },
      status: 'Paid',
      paidAt: new Date()
    });

    // Update order
    order.payment = payment._id;
    order.paymentStatus = 'Paid';
    order.paymentMethod = paymentMethod;
    if (order.orderStatus === 'ORDER_PLACED') {
      order.orderStatus = 'CONFIRMED';
      order.trackingTimeline.push({
        status: 'CONFIRMED',
        title: 'Payment Received & Confirmed',
        description: `Payment of Rs. ${order.totalAmount} received successfully via ${paymentMethod}.`,
        timestamp: new Date()
      });
    }

    await order.save();

    // Generate receipt and send email in background
    const recipientUser = req.user || order.user;
    sendOrderConfirmationEmail(order, recipientUser).catch(err => console.warn('Order confirmation email error:', err.message));
    generatePaymentReceiptPDF(payment, order, recipientUser)
      .then(receiptPdfBuffer => {
        sendPaymentReceiptEmail(payment, order, recipientUser, receiptPdfBuffer);
      })
      .catch(err => {
        console.warn(`[Payment] PDF receipt email error: ${err.message}`);
      });

    // Socket notification
    emitOrderStatusUpdate(order._id, order);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Your order is confirmed.',
      payment,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Payment Receipt PDF
// @route   GET /api/payments/:id/receipt
// @access  Private
exports.downloadPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    const pdfBuffer = await generatePaymentReceiptPDF(payment, payment.order, payment.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=TastyBite_Receipt_${payment.transactionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'order',
        select: 'orderNumber restaurant totalAmount orderStatus',
        populate: { path: 'restaurant', select: 'name image' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue Refund (Admin only)
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin
exports.refundPayment = async (req, res, next) => {
  try {
    const { reason = 'Customer requested refund' } = req.body;
    const payment = await Payment.findById(req.params.id).populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'Refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been refunded'
      });
    }

    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: `RFND_TB_${Date.now()}`,
      refundAmount: payment.amount,
      refundedAt: new Date(),
      reason
    };

    await payment.save();

    if (payment.order) {
      payment.order.paymentStatus = 'Refunded';
      payment.order.orderStatus = 'CANCELLED';
      payment.order.trackingTimeline.push({
        status: 'CANCELLED',
        title: 'Payment Refunded',
        description: `Full refund of Rs. ${payment.amount} issued. Reason: ${reason}`,
        timestamp: new Date()
      });
      await payment.order.save();
      emitOrderStatusUpdate(payment.order._id, payment.order);
    }

    res.status(200).json({
      success: true,
      message: 'Refund issued successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid'
      });
    }

    const razorpay = getRazorpayInstance();
    // Razorpay amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${order.orderNumber || order._id.toString().slice(-8)}`,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TNgbXItY3fibBE',
      order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const order = await Order.findById(orderId).populate('user').populate('restaurant');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found'
      });
    }

    // Verify cryptographic HMAC SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'osNu1DGCZ6uPlN20qgMvtJv6';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid Razorpay cryptographic signature.'
      });
    }

    // Signature verified! Create Payment record
    const paymentNumber = `TB-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = await Payment.create({
      paymentNumber,
      transactionId: razorpay_payment_id,
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: 'RAZORPAY',
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        cardNetwork: 'Razorpay Gateway'
      },
      status: 'Paid',
      paidAt: new Date()
    });

    // Update order status
    order.payment = payment._id;
    order.paymentStatus = 'Paid';
    order.paymentMethod = 'RAZORPAY';
    if (order.orderStatus === 'ORDER_PLACED') {
      order.orderStatus = 'CONFIRMED';
      order.trackingTimeline.push({
        status: 'CONFIRMED',
        title: 'Razorpay Payment Received',
        description: `Payment of Rs. ${order.totalAmount} received successfully via Razorpay (Payment ID: ${razorpay_payment_id}).`,
        timestamp: new Date()
      });
    }

    await order.save();

    // Async receipt generation and email dispatch
    try {
      const recipientUser = req.user || order.user;
      sendOrderConfirmationEmail(order, recipientUser).catch(err => console.warn('[Razorpay Order Email Error]:', err.message));
      sendPaymentReceiptEmail(payment, order, recipientUser).catch(err => console.warn('[Razorpay Receipt Email Error]:', err.message));
    } catch (e) {
      console.error('Non-blocking receipt/email error:', e);
    }

    // Socket real-time push
    emitOrderStatusUpdate(order._id, order);

    res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and order confirmed successfully',
      payment,
      order
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    next(error);
  }
};

