const GroupOrder = require('../models/GroupOrder');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const { emitGroupOrderUpdate } = require('../services/socketService');

// Helper to calculate totals and split shares
const recalculateGroupTotals = (group) => {
  let subtotal = 0;
  const memberCount = Math.max(1, group.members.length);

  group.members.forEach(member => {
    let memberSubtotal = 0;
    (member.items || []).forEach(item => {
      memberSubtotal += (item.price * item.quantity);
    });
    member.individualSubtotal = Number(memberSubtotal.toFixed(2));
    subtotal += memberSubtotal;
  });

  group.subtotal = Number(subtotal.toFixed(2));
  group.tax = Number((subtotal * 0.05).toFixed(2));
  group.deliveryFee = subtotal >= 500 ? 0 : 35;
  group.grandTotal = Number((group.subtotal + group.tax + group.deliveryFee - (group.discount || 0)).toFixed(2));

  // Calculate split billing shares
  if (group.splitType === 'EQUAL') {
    const equalShare = Number((group.grandTotal / memberCount).toFixed(2));
    group.members.forEach(m => {
      m.splitShare = equalShare;
    });
  } else {
    // ITEMIZED: Each member pays their own items + proportional share of tax & delivery
    const sharedOverheads = group.tax + group.deliveryFee - (group.discount || 0);
    const overheadPerMember = memberCount > 0 ? Number((sharedOverheads / memberCount).toFixed(2)) : 0;
    
    group.members.forEach(m => {
      m.splitShare = Number((m.individualSubtotal + overheadPerMember).toFixed(2));
    });
  }
};

// @desc    Create new TastyBite Group Order
// @route   POST /api/group-orders
// @access  Private
exports.createGroupOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      title = 'TastyBite Feast',
      splitType = 'ITEMIZED',
      spendingLimitPerPerson = 0,
      groupNotes = '',
      maxParticipants = 8
    } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Selected restaurant not found'
      });
    }

    // Generate unique random group code
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const groupCode = `TB-${randomCode}`;

    const hostMember = {
      user: req.user._id,
      guestName: req.user.name,
      isHost: true,
      items: [],
      individualSubtotal: 0,
      splitShare: 0,
      hasPaid: false
    };

    const groupOrder = await GroupOrder.create({
      groupCode,
      title,
      host: req.user._id,
      hostName: req.user.name,
      restaurant: restaurantId,
      splitType,
      spendingLimitPerPerson,
      groupNotes,
      maxParticipants,
      members: [hostMember]
    });

    const populatedGroup = await GroupOrder.findById(groupOrder._id).populate('restaurant');

    res.status(201).json({
      success: true,
      message: `Group order created! Share code ${groupCode} with friends.`,
      groupOrder: populatedGroup,
      inviteLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/group-order/${groupCode}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Order by unique code
// @route   GET /api/group-orders/:code
// @access  Public (or Optional Auth)
exports.getGroupByCode = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: `Group order with code '${req.params.code}' was not found or has expired`
      });
    }

    res.status(200).json({
      success: true,
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join Group Order
// @route   POST /api/group-orders/:code/join
// @access  Public (accepts logged in user or guest name)
exports.joinGroupOrder = async (req, res, next) => {
  try {
    const { guestName } = req.body;
    const name = req.user ? req.user.name : (guestName || 'Friend');

    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    if (groupOrder.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `Group order is already ${groupOrder.status.toLowerCase()}`
      });
    }

    // Check if already a member
    const existingIndex = groupOrder.members.findIndex(m => {
      if (req.user && m.user && m.user.toString() === req.user._id.toString()) return true;
      if (m.guestName.toLowerCase() === name.toLowerCase()) return true;
      return false;
    });

    if (existingIndex === -1) {
      if (groupOrder.members.length >= groupOrder.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: 'Group order has reached its maximum member limit'
        });
      }

      groupOrder.members.push({
        user: req.user ? req.user._id : null,
        guestName: name,
        isHost: false,
        items: [],
        individualSubtotal: 0,
        splitShare: 0,
        hasPaid: false
      });

      recalculateGroupTotals(groupOrder);
      await groupOrder.save();
      emitGroupOrderUpdate(groupOrder.groupCode, groupOrder);
    }

    res.status(200).json({
      success: true,
      message: `Welcome to the group, ${name}!`,
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to shared group cart
// @route   POST /api/group-orders/:code/items
// @access  Public (member identified by memberName or userId)
exports.addItemToGroup = async (req, res, next) => {
  try {
    const { foodId, memberName, quantity = 1 } = req.body;
    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    if (groupOrder.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Group order is locked or finalized'
      });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Ensure food belongs to the group's restaurant
    if (food.restaurant.toString() !== groupOrder.restaurant._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You can only add food from the selected group restaurant'
      });
    }

    const targetName = memberName || (req.user ? req.user.name : 'Host');
    let member = groupOrder.members.find(m => m.guestName.toLowerCase() === targetName.toLowerCase());

    if (!member) {
      // Auto-join member
      member = {
        user: req.user ? req.user._id : null,
        guestName: targetName,
        isHost: false,
        items: [],
        individualSubtotal: 0,
        splitShare: 0,
        hasPaid: false
      };
      groupOrder.members.push(member);
      member = groupOrder.members[groupOrder.members.length - 1];
    }

    // Check spending limit if set
    const itemPrice = food.discountPercentage > 0
      ? Number((food.price * (1 - food.discountPercentage / 100)).toFixed(2))
      : food.price;

    if (groupOrder.spendingLimitPerPerson > 0) {
      if ((member.individualSubtotal + itemPrice * quantity) > groupOrder.spendingLimitPerPerson) {
        return res.status(400).json({
          success: false,
          message: `Adding this exceeds individual budget limit of Rs. ${groupOrder.spendingLimitPerPerson}`
        });
      }
    }

    // Check if food already in member's items
    const existingItem = member.items.find(i => i.food.toString() === food._id.toString());
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      member.items.push({
        food: food._id,
        name: food.name,
        image: food.image,
        price: itemPrice,
        quantity: Number(quantity),
        isVeg: food.isVeg,
        addedBy: targetName
      });
    }

    recalculateGroupTotals(groupOrder);
    await groupOrder.save();
    emitGroupOrderUpdate(groupOrder.groupCode, groupOrder);

    res.status(200).json({
      success: true,
      message: `${food.name} added to ${targetName}'s selection`,
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from shared group cart
// @route   DELETE /api/group-orders/:code/items/:itemId
// @access  Public
exports.removeItemFromGroup = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    if (groupOrder.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit items on a locked group order'
      });
    }

    groupOrder.members.forEach(member => {
      member.items = member.items.filter(i => i._id.toString() !== itemId);
    });

    recalculateGroupTotals(groupOrder);
    await groupOrder.save();
    emitGroupOrderUpdate(groupOrder.groupCode, groupOrder);

    res.status(200).json({
      success: true,
      message: 'Item removed from group feast',
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lock status (Host only)
// @route   PUT /api/group-orders/:code/lock
// @access  Private
exports.lockGroupOrder = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    if (groupOrder.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the group host can lock or unlock this order'
      });
    }

    groupOrder.status = groupOrder.status === 'OPEN' ? 'LOCKED' : 'OPEN';
    await groupOrder.save();
    emitGroupOrderUpdate(groupOrder.groupCode, groupOrder);

    res.status(200).json({
      success: true,
      message: `Group order is now ${groupOrder.status}`,
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finalize Group Order into active Order & proceed to checkout
// @route   POST /api/group-orders/:code/checkout
// @access  Private
exports.finalizeGroupOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod = 'UPI' } = req.body;
    const groupOrder = await GroupOrder.findOne({
      groupCode: req.params.code.toUpperCase()
    }).populate('restaurant');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    // Collect all items from all members
    const allItems = [];
    groupOrder.members.forEach(member => {
      (member.items || []).forEach(item => {
        allItems.push({
          food: item.food,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          isVeg: item.isVeg,
          addedBy: member.guestName
        });
      });
    });

    if (!allItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No items in the group order yet!'
      });
    }

    // Create system order
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TB-GRP-${randomDigits}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      restaurant: groupOrder.restaurant._id,
      items: allItems,
      subtotal: groupOrder.subtotal,
      deliveryFee: groupOrder.deliveryFee,
      tax: groupOrder.tax,
      discount: groupOrder.discount,
      totalAmount: groupOrder.grandTotal,
      deliveryAddress: deliveryAddress || req.user.addresses[0],
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'ORDER_PLACED',
      isGroupOrder: true,
      groupOrder: groupOrder._id,
      trackingTimeline: [
        {
          status: 'ORDER_PLACED',
          title: 'Group Order Placed',
          description: `Host ${req.user.name} placed the group order with ${groupOrder.members.length} members.`
        }
      ]
    });

    groupOrder.status = 'ORDERED';
    groupOrder.completedOrder = order._id;
    await groupOrder.save();

    emitGroupOrderUpdate(groupOrder.groupCode, groupOrder);

    res.status(201).json({
      success: true,
      message: 'Group order successfully converted to active order! Please complete payment.',
      order,
      groupOrder
    });
  } catch (error) {
    next(error);
  }
};
