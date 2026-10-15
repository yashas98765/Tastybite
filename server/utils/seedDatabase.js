const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const seedData = require('./seedData');
const { categories: menuCategories, foods: menuFoods } = require('./tastyBiteMenuData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tastybite_db';
    await mongoose.connect(mongoUri);
    console.log(`[TastyBite Seed] Connected to MongoDB at ${mongoUri}`);

    // Clear existing data cleanly
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Category.deleteMany();
    await Food.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();

    console.log('[TastyBite Seed] Cleared existing database collections.');

    // 1. Seed Users (pre-hashed through pre-save hook)
    const createdUsers = [];
    for (const u of seedData.users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const customerUser = createdUsers.find(u => u.role === 'customer');
    console.log(`[TastyBite Seed] Seeded ${createdUsers.length} users (Admin: ${adminUser.email}, Customer: ${customerUser.email})`);

    // 2. Seed 14 Categories
    const createdCategories = await Category.insertMany(menuCategories);
    console.log(`[TastyBite Seed] Seeded ${createdCategories.length} categories.`);

    // 3. Seed Restaurants
    const createdRestaurants = await Restaurant.insertMany(seedData.restaurants);
    console.log(`[TastyBite Seed] Seeded ${createdRestaurants.length} restaurants.`);

    // Helper map to find restaurant by name
    const getRestId = (name) => {
      const r = createdRestaurants.find(item => item.name === name);
      return r ? r._id : createdRestaurants[0]._id;
    };

    // 4. Seed all 155 Food Items with authentic 1-to-1 dish photography
    const foodsList = menuFoods.map((food) => {
      let restName = 'Royal Biryani House';
      if (food.category === 'Seafood') restName = 'Coastal Bay Seafood';
      else if (food.category === 'Biryani') restName = 'Royal Biryani House';
      else if (['Indian Paneer', 'Indian Veg & Mushroom', 'Breads & Rice', 'Starters & Appetizers'].includes(food.category)) restName = 'Punjab Grill & Spice';
      else if (food.category === 'Chinese') restName = 'Dragon Wok Asian Kitchen';
      else if (food.category === 'Continental') restName = (food.name.includes('Pizza') || food.name.includes('Pasta')) ? 'Artisan Crust Pizza Co.' : 'The Burger Club';
      else if (['Desserts', 'Pastries & Bakery'].includes(food.category)) restName = 'Sweet Tooth Patisserie';
      else if (['Hot Beverages', 'Cold Beverages', 'Mocktails'].includes(food.category)) restName = 'The Daily Roast Cafe';
      else if (food.category === 'Sandwiches & Wraps') restName = 'The Burger Club';

      return {
        ...food,
        restaurant: getRestId(restName),
        discountPercentage: food.isBestseller ? 10 : 0,
        ratingCount: Math.floor(Math.random() * 80) + 35,
        nutrition: food.nutrition || { calories: 350, protein: 12, carbs: 45, fat: 14 },
        dietaryTags: food.dietaryTags || (food.isVeg ? ['Vegetarian'] : ['Non-Vegetarian'])
      };
    });

    const createdFoods = await Food.insertMany(foodsList);
    console.log(`[TastyBite Seed] Seeded ${createdFoods.length} authentic 1-to-1 photo food items.`);

    // 5. Seed Coupons
    const createdCoupons = await Coupon.insertMany(seedData.coupons);
    console.log(`[TastyBite Seed] Seeded ${createdCoupons.length} promotional coupons.`);

    // 6. Seed Sample Completed Orders & Payments for analytics / history
    const biryaniFood = createdFoods.find(f => f.name.includes('Biryani')) || createdFoods[0];
    const pizzaFood = createdFoods.find(f => f.name.includes('Pizza')) || createdFoods[1];
    const burgerFood = createdFoods.find(f => f.name.includes('Burger')) || createdFoods[2];

    const sampleOrder1 = await Order.create({
      orderNumber: 'TB-ORD-782190',
      user: customerUser._id,
      restaurant: getRestId('Royal Biryani House'),
      items: [
        {
          food: biryaniFood._id,
          name: biryaniFood.name,
          image: biryaniFood.image,
          price: biryaniFood.price,
          quantity: 2,
          isVeg: biryaniFood.isVeg
        }
      ],
      subtotal: biryaniFood.price * 2,
      tax: Math.round(biryaniFood.price * 2 * 0.05),
      deliveryFee: 30,
      discount: 50,
      couponCode: 'TASTY50',
      totalAmount: Math.round(biryaniFood.price * 2 * 1.05) + 30 - 50,
      deliveryAddress: customerUser.addresses[0],
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'DELIVERED',
      estimatedDeliveryMinutes: 0,
      trackingTimeline: [
        { status: 'ORDER_PLACED', title: 'Order Placed', timestamp: new Date(Date.now() - 3600000 * 2) },
        { status: 'CONFIRMED', title: 'Confirmed by Restaurant', timestamp: new Date(Date.now() - 3600000 * 1.8) },
        { status: 'PREPARING', title: 'Kitchen Preparing Biryani', timestamp: new Date(Date.now() - 3600000 * 1.5) },
        { status: 'READY', title: 'Food Packed & Ready', timestamp: new Date(Date.now() - 3600000 * 1.2) },
        { status: 'OUT_FOR_DELIVERY', title: 'Rider On The Way', timestamp: new Date(Date.now() - 3600000 * 0.8) },
        { status: 'DELIVERED', title: 'Order Delivered Successfully', timestamp: new Date(Date.now() - 3600000 * 0.4) }
      ]
    });

    const samplePayment1 = await Payment.create({
      paymentNumber: 'TB-PAY-542109',
      transactionId: 'TXN_TB_UPI_9845237890',
      order: sampleOrder1._id,
      user: customerUser._id,
      amount: sampleOrder1.totalAmount,
      paymentMethod: 'UPI',
      paymentDetails: { upiId: 'customer@okaxis' },
      status: 'Paid',
      paidAt: new Date(Date.now() - 3600000 * 2)
    });
    sampleOrder1.payment = samplePayment1._id;
    await sampleOrder1.save();

    // Sample Active in-flight order
    const sampleOrder2 = await Order.create({
      orderNumber: 'TB-ORD-910482',
      user: customerUser._id,
      restaurant: getRestId('Artisan Crust Pizza Co.'),
      items: [
        {
          food: pizzaFood._id,
          name: pizzaFood.name,
          image: pizzaFood.image,
          price: pizzaFood.price,
          quantity: 1,
          isVeg: pizzaFood.isVeg
        },
        {
          food: burgerFood._id,
          name: burgerFood.name,
          image: burgerFood.image,
          price: burgerFood.price,
          quantity: 1,
          isVeg: burgerFood.isVeg
        }
      ],
      subtotal: pizzaFood.price + burgerFood.price,
      tax: Math.round((pizzaFood.price + burgerFood.price) * 0.05),
      deliveryFee: 35,
      discount: 0,
      totalAmount: Math.round((pizzaFood.price + burgerFood.price) * 1.05) + 35,
      deliveryAddress: customerUser.addresses[0],
      paymentMethod: 'CARD',
      paymentStatus: 'Paid',
      orderStatus: 'PREPARING',
      estimatedDeliveryMinutes: 22,
      riderDetails: {
        name: 'Vikram Joshi',
        phone: '+91 98450 77112',
        vehicleNumber: 'KA 03 HM 2145',
        rating: 4.9
      },
      trackingTimeline: [
        { status: 'ORDER_PLACED', title: 'Order Placed', timestamp: new Date(Date.now() - 900000) },
        { status: 'CONFIRMED', title: 'Order Confirmed', timestamp: new Date(Date.now() - 600000) },
        { status: 'PREPARING', title: 'Chef is baking your artisan pizza', timestamp: new Date(Date.now() - 200000) }
      ]
    });

    const samplePayment2 = await Payment.create({
      paymentNumber: 'TB-PAY-771239',
      transactionId: 'TXN_TB_CARD_8877112233',
      order: sampleOrder2._id,
      user: customerUser._id,
      amount: sampleOrder2.totalAmount,
      paymentMethod: 'CARD',
      paymentDetails: { cardLastFour: '4242', cardNetwork: 'Visa' },
      status: 'Paid',
      paidAt: new Date(Date.now() - 900000)
    });
    sampleOrder2.payment = samplePayment2._id;
    await sampleOrder2.save();

    console.log('[TastyBite Seed] Seeded sample orders & payments successfully.');
    console.log('----------------------------------------------------');
    console.log('TASTYBITE SEEDING COMPLETE!');
    console.log('Test Accounts:');
    console.log('Admin:    admin@tastybite.com    | Admin@123');
    console.log('Customer: customer@tastybite.com | Customer@123');
    console.log('----------------------------------------------------');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`[TastyBite Seed Error]: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = seedDB;

if (require.main === module) {
  seedDB();
}
