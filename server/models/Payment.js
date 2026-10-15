const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'UPI', 'NETBANKING', 'COD', 'WALLET', 'RAZORPAY'],
    required: true
  },
  paymentDetails: {
    cardLastFour: String,
    cardNetwork: String,
    upiId: String,
    bankName: String,
    walletName: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Paid'
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
    reason: String
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
