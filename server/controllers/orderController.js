const Order = require('../models/Order');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { generateOrderInvoicePDF } = require('../services/pdfService');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');
const { emitOrderStatusUpdate } = require('../services/socketService');
const { formatOrderWhatsAppMessage, getWhatsAppUrl } = require('../services/whatsappService');
const { getRandomDeliveryPartner } = require('../utils/deliveryPartnerHelper');

// @desc    Create new customer order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod = 'UPI',
      couponCode,
      specialInstructions,
      isGroupOrder = false,
      groupOrderId
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items before checking out.'
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery address and phone number are required'
      });
    }

    // Calculate subtotal and verify items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const food = await Food.findById(item.food || item.foodId || item._id);
      if (!food) {
        return res.status(400).json({
          success: false,
          message: `Food item '${item.name || 'Unknown'}' is no longer available`
        });
      }

      const itemPrice = food.discountPercentage > 0
        ? Number((food.price * (1 - food.discountPercentage / 100)).toFixed(2))
        : food.price;

      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += itemPrice * qty;

      validatedItems.push({
        food: food._id,
        name: food.name,
        image: food.image,
        price: itemPrice,
        quantity: qty,
        isVeg: food.isVeg,
        addedBy: item.addedBy || req.user.name
      });
    }

    // Taxes (5% GST) and Delivery fee
    const tax = Number((subtotal * 0.05).toFixed(2));
    const deliveryFee = subtotal >= 500 ? 0 : 35;

    // Check Coupon Discount
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
        if (appliedCoupon.discountPercentage > 0) {
          discount = Math.min((subtotal * appliedCoupon.discountPercentage) / 100, appliedCoupon.maxDiscount);
        } else if (appliedCoupon.flatDiscount > 0) {
          discount = Math.min(appliedCoupon.flatDiscount, subtotal);
        }
      }
    }

    const totalAmount = Number((subtotal + tax + deliveryFee - discount).toFixed(2));

    // Generate unique order number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TB-ORD-${randomDigits}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      restaurant: restaurantId,
      items: validatedItems,
      subtotal,
      tax,
      deliveryFee,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'ORDER_PLACED',
      estimatedDeliveryMinutes: 35,
      riderDetails: getRandomDeliveryPartner(),
      isGroupOrder,
      groupOrder: groupOrderId || null,
      specialInstructions: specialInstructions || '',
      trackingTimeline: [
        {
          status: 'ORDER_PLACED',
          title: 'Order Placed',
          description: 'Your TastyBite order has been sent to the restaurant.'
        }
      ]
    });

    if (paymentMethod === 'COD') {
      sendOrderConfirmationEmail(order, req.user).catch(err => console.warn('COD order confirmation email error:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image rating location')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('user', 'name email phone')
      .populate('payment');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Allow user or admin to view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;

    const timelineTitles = {
      CONFIRMED: 'Order Confirmed',
      PREPARING: 'Kitchen Preparing Your Meal',
      READY: 'Order Packed & Ready',
      OUT_FOR_DELIVERY: 'TastyBite Rider Out for Delivery',
      DELIVERED: 'Delivered to Doorstep',
      CANCELLED: 'Order Cancelled'
    };

    order.trackingTimeline.push({
      status,
      title: timelineTitles[status] || status,
      description: note || `Order updated to ${status}`,
      timestamp: new Date()
    });

    if (status === 'DELIVERED') {
      order.estimatedDeliveryMinutes = 0;
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'Paid';
      }
    }

    await order.save();

    // 1. Emit real-time Socket.IO event
    emitOrderStatusUpdate(order._id, order);

    // 2. Dispatch status update email in background
    sendOrderStatusEmail(order, order.user, status);

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advance order status to next stage (for live progression / demo / auto-advance)
// @route   PUT /api/orders/:id/advance-stage
// @access  Private
exports.advanceOrderStage = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const stageSequence = ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = stageSequence.indexOf(order.orderStatus);

    if (currentIdx === -1 || currentIdx >= stageSequence.length - 1) {
      return res.status(200).json({
        success: true,
        message: 'Order has already reached final stage',
        order
      });
    }

    const nextStatus = stageSequence[currentIdx + 1];
    order.orderStatus = nextStatus;

    const timelineTitles = {
      CONFIRMED: 'Order Confirmed',
      PREPARING: 'Kitchen Preparing Your Meal',
      READY: 'Order Packed & Ready for Pickup',
      OUT_FOR_DELIVERY: 'TastyBite Rider En Route',
      DELIVERED: 'Delivered to Your Door'
    };

    order.trackingTimeline.push({
      status: nextStatus,
      title: timelineTitles[nextStatus] || nextStatus,
      description: `Order successfully progressed to ${nextStatus}`,
      timestamp: new Date()
    });

    if (nextStatus === 'DELIVERED') {
      order.estimatedDeliveryMinutes = 0;
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'Paid';
      }
    } else if (nextStatus === 'OUT_FOR_DELIVERY') {
      order.estimatedDeliveryMinutes = 12;
    } else if (nextStatus === 'READY') {
      order.estimatedDeliveryMinutes = 18;
    } else if (nextStatus === 'PREPARING') {
      order.estimatedDeliveryMinutes = 25;
    }

    await order.save();

    // 1. Real-time WebSocket broadcast
    emitOrderStatusUpdate(order._id, order);

    // 2. Dispatch status email notification
    sendOrderStatusEmail(order, order.user, nextStatus).catch(err => console.warn('Status email notification error:', err.message));

    res.status(200).json({
      success: true,
      message: `Order status advanced to ${nextStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Order Invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.downloadInvoicePDF = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const pdfBuffer = await generateOrderInvoicePDF(order, order.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=TastyBite_Invoice_${order.orderNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'OUT_FOR_DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.orderStatus = 'CANCELLED';
    order.trackingTimeline.push({
      status: 'CANCELLED',
      title: 'Order Cancelled',
      description: 'Order was cancelled by customer',
      timestamp: new Date()
    });

    await order.save();
    emitOrderStatusUpdate(order._id, order);

    // Send status email for cancellation
    sendOrderStatusEmail(order, req.user, 'CANCELLED');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WhatsApp share details & formatted message
// @route   GET /api/orders/:id/whatsapp-share
// @access  Private
exports.getWhatsAppShareDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name location image')
      .populate('payment')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const message = formatOrderWhatsAppMessage(order, order.payment);
    const customerPhone = order.deliveryAddress?.phone || order.user?.phone || '';
    const customerWhatsAppUrl = getWhatsAppUrl(customerPhone, message);
    const supportNumber = process.env.WHATSAPP_SUPPORT_NUMBER || '917619290168';
    const supportWhatsAppUrl = getWhatsAppUrl(supportNumber, message);

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        totalAmount: order.totalAmount,
        message,
        customerPhone,
        customerWhatsAppUrl,
        supportPhone: process.env.CONTACT_PHONE || '+91 76192 90168',
        supportWhatsAppUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

