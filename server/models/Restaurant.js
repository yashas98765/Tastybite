const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  tagline: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Restaurant description is required']
  },
  image: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String,
    default: ''
  },
  cuisines: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 120
  },
  deliveryTimeMinutes: {
    type: Number,
    default: 30
  },
  deliveryFee: {
    type: Number,
    default: 30
  },
  minOrder: {
    type: Number,
    default: 150
  },
  costForTwo: {
    type: Number,
    default: 400
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, default: 'Bangalore' },
    area: { type: String, required: true },
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 }
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  pureVeg: {
    type: Boolean,
    default: false
  },
  openingHours: {
    type: String,
    default: '10:00 AM - 11:00 PM'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
