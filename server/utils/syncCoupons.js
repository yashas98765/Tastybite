const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Coupon = require('../models/Coupon');
const seedData = require('./seedData');

async function syncCoupons() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tastybite_db';
    await mongoose.connect(mongoUri);
    console.log(`[TastyBite] Connected to MongoDB at ${mongoUri}`);

    let upsertedCount = 0;
    for (const c of seedData.coupons) {
      await Coupon.findOneAndUpdate(
        { code: c.code },
        { $set: { ...c, isActive: true } },
        { upsert: true, new: true }
      );
      upsertedCount++;
    }

    console.log(`[TastyBite] Successfully synced and activated ${upsertedCount} coupons!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[TastyBite] Error syncing coupons:', error);
    process.exit(1);
  }
}

syncCoupons();
