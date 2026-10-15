const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: true },
  addedBy: { type: String, default: 'Self' } // helpful for Group Orders
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 30
  },
  tax: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    tag: { type: String, default: 'Home' }
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'UPI', 'NETBANKING', 'COD', 'WALLET', 'RAZORPAY'],
    default: 'RAZORPAY'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  orderStatus: {
    type: String,
    enum: ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'ORDER_PLACED'
  },
  estimatedDeliveryMinutes: {
    type: Number,
    default: 35
  },
  riderDetails: {
    name: { type: String, default: 'Ramesh Kumar' },
    phone: { type: String, default: '+91 98450 12345' },
    vehicleNumber: { type: String, default: 'KA 01 EB 4892' },
    rating: { type: Number, default: 4.8 }
  },
  trackingTimeline: [timelineSchema],
  isGroupOrder: {
    type: Boolean,
    default: false
  },
  groupOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupOrder'
  },
  specialInstructions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
