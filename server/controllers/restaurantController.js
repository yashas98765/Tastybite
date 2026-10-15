const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

// @desc    Get all restaurants with search and filters
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, rating, pureVeg, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisines = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (pureVeg === 'true') {
      query.pureVeg = true;
    }

    let sortOption = { rating: -1 };
    if (sort === 'deliveryTime') {
      sortOption = { deliveryTimeMinutes: 1 };
    } else if (sort === 'costLow') {
      sortOption = { costForTwo: 1 };
    } else if (sort === 'costHigh') {
      sortOption = { costForTwo: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const restaurants = await Restaurant.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant by ID with its categorized menu
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    let menu = await Food.find({ restaurant: restaurant._id });

    // If restaurant has no items directly mapped to its id, pull authentic matching items from food catalog
    if (!menu || menu.length === 0) {
      const matchCriteria = {};
      if (restaurant.pureVeg) {
        matchCriteria.isVeg = true;
      }

      const cuisineKeywords = (restaurant.cuisines || []).map(c => new RegExp(c, 'i'));
      if (cuisineKeywords.length > 0) {
        menu = await Food.find({
          ...matchCriteria,
          $or: [
            { category: { $in: cuisineKeywords } },
            { name: { $in: cuisineKeywords } }
          ]
        }).limit(20);
      }

      if (!menu || menu.length === 0) {
        menu = await Food.find(matchCriteria).limit(16);
      }
    }

    // Group menu items by category
    const categorizedMenu = {};
    menu.forEach(item => {
      const cat = item.category || 'Specialties';
      if (!categorizedMenu[cat]) {
        categorizedMenu[cat] = [];
      }
      categorizedMenu[cat].push(item);
    });

    res.status(200).json({
      success: true,
      restaurant,
      menu,
      categorizedMenu
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant (Admin only)
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Restaurant added successfully',
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant (Admin only)
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant (Admin only)
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Also remove associated foods
    await Food.deleteMany({ restaurant: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Restaurant and its menu deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
