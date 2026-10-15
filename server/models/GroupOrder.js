const mongoose = require('mongoose');

const memberItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  isVeg: { type: Boolean, default: true },
  addedBy: { type: String, required: true }
});

const groupMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestName: {
    type: String,
    required: true
  },
  isHost: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  items: [memberItemSchema],
  individualSubtotal: {
    type: Number,
    default: 0
  },
  splitShare: {
    type: Number,
    default: 0
  },
  hasPaid: {
    type: Boolean,
    default: false
  }
});

const groupOrderSchema = new mongoose.Schema({
  groupCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    default: 'TastyBite Feast'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  members: [groupMemberSchema],
  status: {
    type: String,
    enum: ['OPEN', 'LOCKED', 'ORDERED', 'CANCELLED'],
    default: 'OPEN'
  },
  splitType: {
    type: String,
    enum: ['ITEMIZED', 'EQUAL'],
    default: 'ITEMIZED'
  },
  spendingLimitPerPerson: {
    type: Number,
    default: 0
  },
  groupNotes: {
    type: String,
    default: ''
  },
  maxParticipants: {
    type: Number,
    default: 10
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  },
  subtotal: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 30
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  completedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
