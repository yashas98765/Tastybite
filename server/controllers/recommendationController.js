const Food = require('../models/Food');

/**
 * TastyBite Smart Picks - Intelligent Rule-Based Food Recommendation Engine
 * Evaluates dietary requirements, budget constraints, meal types, and user flavor preferences
 * without requiring costly 3rd-party black-box AI APIs.
 */
exports.getSmartPicks = async (req, res, next) => {
  try {
    const {
      dietary = 'all',
      budget = 500,
      mealType = 'All',
      spiceLevel = 'All',
      cuisine = 'All',
      limit = 6
    } = req.query;

    const maxBudget = Number(budget) || 500;

    // Build base filter query
    let query = {
      isAvailable: true,
      price: { $lte: maxBudget }
    };

    // Dietary filter
    if (dietary === 'veg') {
      query.isVeg = true;
    } else if (dietary === 'non-veg') {
      query.isVeg = false;
    } else if (['keto', 'high-protein', 'low-calorie', 'gluten-free', 'vegan'].includes(dietary.toLowerCase())) {
      const tagSearch = dietary.toLowerCase().replace('-', ' ');
      query.dietaryTags = { $in: [new RegExp(tagSearch, 'i')] };
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, 'i') };
    }

    const eligibleFoods = await Food.find(query).populate('restaurant', 'name location rating deliveryTimeMinutes deliveryFee isOpen');

    // Rule-based heuristic scoring engine
    const scoredFoods = eligibleFoods.map(food => {
      let score = (food.rating || 4.0) * 15; // Base 0 - 75 points
      const reasons = [];

      // 1. Bestseller / Popularity
      if (food.isBestseller) {
        score += 20;
        reasons.push('Community favorite bestseller');
      }

      // 2. Meal Type Alignment
      if (mealType && mealType !== 'All') {
        if (food.mealType === mealType) {
          score += 25;
          reasons.push(`Perfect for ${mealType.toLowerCase()}`);
        }
      }

      // 3. Spice Level Matching
      if (spiceLevel && spiceLevel !== 'All') {
        if (food.spiceLevel === spiceLevel) {
          score += 20;
          reasons.push(`${spiceLevel} spice preference match`);
        } else if (
          (spiceLevel === 'Mild' && food.spiceLevel === 'Medium') ||
          (spiceLevel === 'Medium' && (food.spiceLevel === 'Mild' || food.spiceLevel === 'Hot'))
        ) {
          score += 10;
        }
      }

      // 4. Value-for-Money Budget Proximity
      const budgetRatio = food.price / maxBudget;
      if (budgetRatio >= 0.5 && budgetRatio <= 0.95) {
        score += 15;
        reasons.push('High value-for-money');
      }

      // 5. Special discount incentive
      if (food.discountPercentage > 0) {
        score += Math.min(food.discountPercentage, 20);
        reasons.push(`${food.discountPercentage}% seasonal savings`);
      }

      // 6. Healthy nutrition profile bonus
      if (food.nutrition?.protein >= 25) {
        score += 10;
        reasons.push('Rich protein source');
      } else if (food.nutrition?.calories <= 350) {
        score += 8;
        reasons.push('Calorie-conscious pick');
      }

      return {
        food,
        score: Math.round(score),
        primaryReason: reasons[0] || 'Curated chef recommendation',
        matchedReasons: reasons
      };
    });

    // Sort by algorithmic score descending
    scoredFoods.sort((a, b) => b.score - a.score);

    const recommendations = scoredFoods.slice(0, Number(limit)).map(item => ({
      ...item.food.toObject(),
      recommendationScore: item.score,
      recommendationReason: item.primaryReason,
      matchedReasons: item.matchedReasons
    }));

    res.status(200).json({
      success: true,
      criteria: {
        dietary,
        budget: maxBudget,
        mealType,
        spiceLevel,
        cuisine
      },
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
