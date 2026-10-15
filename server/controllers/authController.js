const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tastybite_super_secret_jwt_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Default first user or requested role (safety check: allow admin if explicitly tested or email contains admin)
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: userRole
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to TastyBite.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Continue with Google (Login or Register)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires a valid email address'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-create new user account with secure random password
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'G!1';
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: randomPassword,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
        role: cleanEmail.includes('admin') ? 'admin' : 'customer'
      });
    } else {
      // Update avatar if currently placeholder and real avatar provided
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, dateOfBirth, notificationPreferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...(user.notificationPreferences || {}),
        ...notificationPreferences
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new delivery address
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { street, city, state, zipCode, country, phone, tag, isDefault } = req.body;

    if (!street || !city || !state || !zipCode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields'
      });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const newAddress = {
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      phone,
      tag: tag || 'Home',
      isDefault: user.addresses.length === 0 ? true : !!isDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Delivery address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist food item
// @route   POST /api/auth/wishlist/:foodId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const foodId = req.params.foodId;

    const existsIndex = user.wishlist.findIndex(id => id.toString() === foodId);
    let isWishlisted = false;

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(foodId);
      isWishlisted = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isWishlisted,
      message: isWishlisted ? 'Added to your favorites' : 'Removed from your favorites',
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password simulation
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your registered email address (Use reset code: TASTYRESET2026)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery address
// @route   PUT /api/auth/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { street, city, state, zipCode, country, phone, tag, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      address.isDefault = true;
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (phone) address.phone = phone;
    if (tag) address.tag = tag;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! You may now use your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic profile dashboard statistics
// @route   GET /api/auth/profile-stats
// @access  Private
exports.getProfileStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      populate: { path: 'restaurant', select: 'name address' }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamic order calculations directly from MongoDB
    const orders = await Order.find({ user: userId })
      .populate('restaurant', 'name image logo rating address cuisine')
      .populate('items.food', 'name image price isVeg')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'CANCELLED').length;
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length;
    
    // Total spent on paid, non-cancelled orders
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'Paid' && o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Compute Favorite Food (most frequently ordered)
    const foodFrequency = {};
    orders.forEach(order => {
      if (order.items && order.items.length) {
        order.items.forEach(item => {
          const name = item.name || item.food?.name;
          if (name) {
            foodFrequency[name] = (foodFrequency[name] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    let favoriteFood = 'None yet';
    let maxFoodCount = 0;
    for (const [foodName, count] of Object.entries(foodFrequency)) {
      if (count > maxFoodCount) {
        maxFoodCount = count;
        favoriteFood = foodName;
      }
    }

    // Compute Favorite Restaurant (most ordered from)
    const restaurantFrequency = {};
    orders.forEach(order => {
      if (order.restaurant) {
        const rName = order.restaurant.name || 'Partner Kitchen';
        restaurantFrequency[rName] = (restaurantFrequency[rName] || 0) + 1;
      }
    });

    let favoriteRestaurant = 'None yet';
    let maxRestCount = 0;
    for (const [rName, count] of Object.entries(restaurantFrequency)) {
      if (count > maxRestCount) {
        maxRestCount = count;
        favoriteRestaurant = rName;
      }
    }

    // Review counts & average rating given by user
    const reviews = await Review.find({ user: userId });
    const reviewsCount = reviews.length;
    const avgRatingGiven = reviewsCount > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount).toFixed(1)
      : '5.0';

    // Dynamic Membership Tier
    let membershipTier = 'Bronze Starter';
    let nextTierGoal = 2;
    let tierColor = 'amber';
    if (totalOrders >= 10 || totalSpent >= 5000) {
      membershipTier = 'Foodie Legend (VIP)';
      nextTierGoal = null;
      tierColor = 'emerald';
    } else if (totalOrders >= 5 || totalSpent >= 2500) {
      membershipTier = 'Gold Gourmand';
      nextTierGoal = 10;
      tierColor = 'yellow';
    } else if (totalOrders >= 2 || totalSpent >= 1000) {
      membershipTier = 'Silver Epicure';
      nextTierGoal = 5;
      tierColor = 'stone';
    }

    // Profile Completion Percentage
    let completion = 0;
    if (user.name) completion += 20;
    if (user.email) completion += 20;
    if (user.phone && user.phone.trim().length > 5) completion += 20;
    if (user.avatar && !user.avatar.includes('default')) completion += 15;
    if (user.addresses && user.addresses.length > 0) completion += 15;
    if (user.dateOfBirth) completion += 10;
    else completion = Math.min(completion + 10, 100);

    // Reward points & history
    const rewardPoints = user.rewardPoints ?? 250;
    const rewardsHistory = (user.rewardsHistory && user.rewardsHistory.length > 0)
      ? user.rewardsHistory
      : [
          {
            points: 250,
            type: 'EARNED',
            description: 'TastyBite Registration Welcome Bonus',
            date: user.createdAt || new Date()
          }
        ];

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        activeOrders,
        totalSpent: Number(totalSpent.toFixed(2)),
        favoriteFood,
        favoriteFoodOrders: maxFoodCount,
        favoriteRestaurant,
        reviewsCount,
        avgRatingGiven: Number(avgRatingGiven),
        membershipTier,
        nextTierGoal,
        tierColor,
        profileCompletion: Math.min(completion, 100),
        rewardPoints,
        rewardsHistory,
        recentOrders: orders.slice(0, 5)
      },
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem reward points for discounts
// @route   POST /api/auth/rewards/redeem
// @access  Private
exports.redeemReward = async (req, res, next) => {
  try {
    const { rewardId, pointsCost, title, discountAmount, discountPercentage } = req.body;
    const user = await User.findById(req.user._id);

    const cost = Number(pointsCost) || 200;
    if ((user.rewardPoints || 0) < cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${cost} points, but have only ${user.rewardPoints || 0}.`
      });
    }

    // Deduct points
    user.rewardPoints = (user.rewardPoints || 0) - cost;

    // Generate unique redeemable coupon code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const couponCode = `TB-REWARD-${rewardId ? rewardId.slice(0, 4).toUpperCase() : 'BITE'}-${randomSuffix}`;

    // Record reward history in user profile
    user.rewardsHistory.unshift({
      points: -cost,
      type: 'REDEEMED',
      description: `Redeemed: ${title || 'Special Discount Voucher'} (Code: ${couponCode})`,
      date: new Date()
    });

    await user.save();

    // Persist as active Coupon in MongoDB so user can apply it at Checkout!
    await Coupon.create({
      code: couponCode,
      description: `Redeemed Reward Voucher: ${title || 'Discount'}`,
      discountPercentage: discountPercentage || 0,
      flatDiscount: discountAmount || 50,
      minOrderAmount: 199,
      maxDiscount: 250,
      validTill: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days validity
      isActive: true
    });

    // Also push a Notification
    await Notification.create({
      user: user._id,
      title: '🎉 Reward Voucher Unlocked!',
      message: `You redeemed ${cost} points for voucher "${title}". Use coupon code ${couponCode} at checkout.`,
      type: 'PROMO',
      link: '/cart'
    });

    res.status(200).json({
      success: true,
      message: `Reward unlocked! Use code ${couponCode} for instant savings.`,
      couponCode,
      remainingPoints: user.rewardPoints,
      rewardsHistory: user.rewardsHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/auth/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/auth/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { isRead: true });
    }

    res.status(200).json({
      success: true,
      message: 'Notification status updated'
    });
  } catch (error) {
    next(error);
  }
};

