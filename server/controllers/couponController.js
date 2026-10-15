const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code'
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order amount of Rs. ${coupon.minOrderAmount}`
      });
    }

    let discountAmount = 0;
    if (coupon.discountPercentage > 0) {
      discountAmount = Math.min((orderSubtotal * coupon.discountPercentage) / 100, coupon.maxDiscount);
    } else if (coupon.flatDiscount > 0) {
      discountAmount = Math.min(coupon.flatDiscount, orderSubtotal);
    }

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You saved Rs. ${discountAmount.toFixed(2)}`,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountPercentage: coupon.discountPercentage || 0,
        flatDiscount: coupon.flatDiscount || 0,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscount: coupon.maxDiscount || 500,
        discountAmount: Number(discountAmount.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};
