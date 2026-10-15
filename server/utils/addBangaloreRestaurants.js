const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Restaurant = require('../models/Restaurant');
const seedData = require('./seedData');

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tastybite_db';
    await mongoose.connect(mongoUri);
    console.log('[TastyBite] Connected to MongoDB');

    let addedCount = 0;
    let updatedCount = 0;

    for (const rest of seedData.restaurants) {
      const existing = await Restaurant.findOne({ name: rest.name });
      if (!existing) {
        await Restaurant.create(rest);
        addedCount++;
        console.log(`+ Added restaurant: ${rest.name} (${rest.location.area})`);
      } else {
        await Restaurant.updateOne({ _id: existing._id }, { $set: rest });
        updatedCount++;
      }
    }

    const total = await Restaurant.countDocuments();
    console.log(`[TastyBite] Done! Added: ${addedCount}, Updated: ${updatedCount}, Total Bangalore Restaurants: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('Error adding restaurants:', err);
    process.exit(1);
  }
};

run();
