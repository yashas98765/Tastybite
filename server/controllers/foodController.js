const Food = require('../models/Food');
const Category = require('../models/Category');

// @desc    Get all foods with search, category, veg, spice, price filters
// @route   GET /api/foods
// @access  Public
exports.getAllFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isVeg,
      cuisine,
      spiceLevel,
      mealType,
      maxPrice,
      sort,
      isAvailable
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { dietaryTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, 'i') };
    }

    if (spiceLevel && spiceLevel !== 'All') {
      query.spiceLevel = spiceLevel;
    }

    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    let sortOption = { rating: -1 };
    if (sort === 'priceLow') {
      sortOption = { price: 1 };
    } else if (sort === 'priceHigh') {
      sortOption = { price: -1 };
    } else if (sort === 'prepTime') {
      sortOption = { prepTimeMinutes: 1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'popular') {
      sortOption = { ratingCount: -1 };
    }

    const foods = await Food.find(query).populate('restaurant', 'name location rating deliveryTimeMinutes deliveryFee isOpen');

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant');
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Get related recommendations from same restaurant or category
    const relatedFoods = await Food.find({
      category: food.category,
      _id: { $ne: food._id }
    }).limit(4);

    res.status(200).json({
      success: true,
      food,
      relatedFoods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food categories
// @route   GET /api/foods/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new food item (Admin only)
// @route   POST /api/foods
// @access  Private/Admin
exports.createFood = async (req, res, next) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item (Admin only)
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item (Admin only)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle food availability (in stock / out of stock)
// @route   PATCH /api/foods/:id/toggle-availability
// @access  Private/Admin
exports.toggleAvailability = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.status(200).json({
      success: true,
      message: `Food marked as ${food.isAvailable ? 'Available' : 'Out of Stock'}`,
      isAvailable: food.isAvailable
    });
  } catch (error) {
    next(error);
  }
};
