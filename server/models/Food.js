const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Food description is required']
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Food price is required'],
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 45
  },
  prepTimeMinutes: {
    type: Number,
    default: 20
  },
  spiceLevel: {
    type: String,
    enum: ['None', 'Mild', 'Medium', 'Hot', 'Extra Spicy'],
    default: 'Medium'
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'],
    default: 'Lunch'
  },
  cuisine: {
    type: String,
    default: 'North Indian'
  },
  nutrition: {
    calories: { type: Number, default: 350 },
    protein: { type: Number, default: 12 }, // grams
    carbs: { type: Number, default: 45 }, // grams
    fat: { type: Number, default: 14 } // grams
  },
  dietaryTags: [{
    type: String
  }],
  portionSize: {
    type: String,
    default: '1 Serving'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
