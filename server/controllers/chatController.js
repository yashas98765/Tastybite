const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Order = require('../models/Order');
const { emitNewChatMessage } = require('../services/socketService');

// Automated support assistant responses for high user satisfaction
const getBotResponse = async (text, orderId, userId) => {
  const lower = text.toLowerCase();

  if (lower.includes('status') || lower.includes('where is my order') || lower.includes('track') || lower.includes('order')) {
    if (orderId) {
      const order = await Order.findOne({ $or: [{ orderNumber: orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }] });
      if (order) {
        return `Hello! Your order #${order.orderNumber} is currently in '${order.orderStatus.replace(/_/g, ' ')}' stage. Estimated delivery in ${order.estimatedDeliveryMinutes} mins. Rider: ${order.riderDetails?.name || 'Assigned'} (${order.riderDetails?.phone || '+91 98450 77112'}).`;
      }
    }
    if (userId) {
      const latestOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
      if (latestOrder) {
        return `Your latest order #${latestOrder.orderNumber} is currently in '${latestOrder.orderStatus.replace(/_/g, ' ')}' stage. Estimated delivery in ${latestOrder.estimatedDeliveryMinutes || 20} mins. Total: ₹${latestOrder.totalAmount}.`;
      }
    }
    return "To track your order, please provide your Order ID (e.g. TB-ORD-782190) or check the 'Orders' section in your account.";
  }

  if (lower.includes('refund') || lower.includes('money back') || lower.includes('cancel')) {
    return "Our TastyBite refund policy ensures 100% refund for cancelled or unfulfilled orders. Refunds to UPI take ~15 mins, and Credit/Debit cards take 2-3 business days.";
  }

  if (lower.includes('group') || lower.includes('split') || lower.includes('friends')) {
    return "TastyBite Group Feast lets you share a party link with friends so everyone adds what they want, with instant split billing!";
  }

  if (lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('whatsapp') || lower.includes('contact')) {
    return "You can connect directly with our priority customer desk on WhatsApp at +91 76192 90168 or email yashas.s.h2601@gmail.com. We operate 7:00 AM to midnight daily.";
  }

  if (lower.includes('menu') || lower.includes('food') || lower.includes('categories') || lower.includes('biryani') || lower.includes('dish')) {
    return "TastyBite features 155+ chef-crafted dishes organized into 14 distinct categories (including Biryani, Seafood, Indian Paneer, Chinese, Continental, Pastries & Bakery, and Mocktails) with individual dish photographs!";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return "Hello! Welcome to TastyBite 24/7 Customer Care. How may I assist you with your orders, menu, or delivery today?";
  }

  return "Thank you for reaching out! A TastyBite support executive has been notified. Feel free to ask about our 14 menu categories, promo code TASTY50, or track active orders.";
};

// @desc    Get or create active chat for current customer
// @route   GET /api/chats/my-chat
// @access  Private
exports.getMyChat = async (req, res, next) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id, status: { $ne: 'CLOSED' } });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        userName: req.user.name || 'Valued Customer',
        userEmail: req.user.email || 'customer@tastybite.com',
        subject: 'TastyBite Customer Support',
        status: 'OPEN'
      });

      // Initial welcome message
      await Message.create({
        chat: chat._id,
        sender: null,
        senderName: 'TastyBite Assistant',
        senderRole: 'bot',
        text: `Hi ${req.user.name ? req.user.name.split(' ')[0] : 'there'}! Welcome to TastyBite 24/7 Care. How can we help you today?`
      });
    }

    let messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
    if (!messages || messages.length === 0) {
      const initialMsg = await Message.create({
        chat: chat._id,
        sender: null,
        senderName: 'TastyBite Assistant',
        senderRole: 'bot',
        text: `Hi ${req.user.name ? req.user.name.split(' ')[0] : 'there'}! Welcome to TastyBite 24/7 Care. How can we help you today?`
      });
      messages = [initialMsg];
    }

    res.status(200).json({
      success: true,
      chat,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message in customer chat
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { text, orderId } = req.body;
    const { chatId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty'
      });
    }

    let chat = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await Chat.findById(chatId);
    }
    if (!chat) {
      chat = await Chat.findOne({ user: req.user._id, status: { $ne: 'CLOSED' } });
      if (!chat) {
        chat = await Chat.create({
          user: req.user._id,
          userName: req.user.name || 'Valued Customer',
          userEmail: req.user.email || 'customer@tastybite.com',
          status: 'OPEN'
        });
      }
    }

    const userMessage = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role === 'admin' ? 'admin' : 'customer',
      text: text.trim()
    });

    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();
    if (orderId && !chat.orderId) {
      chat.orderId = orderId;
    }
    await chat.save();

    // Emit live customer message
    emitNewChatMessage(chat._id, userMessage);

    // If customer sent it and no admin replied yet, trigger bot assistance after short delay
    if (req.user.role !== 'admin') {
      const botResponseText = await getBotResponse(text, chat.orderId || orderId, req.user._id);
      if (botResponseText) {
        setTimeout(async () => {
          try {
            const botMessage = await Message.create({
              chat: chat._id,
              sender: null,
              senderName: 'TastyBite Assistant',
              senderRole: 'bot',
              text: botResponseText
            });
            chat.lastMessage = botResponseText;
            await chat.save();
            emitNewChatMessage(chat._id, botMessage);
          } catch (e) {
            console.error(e);
          }
        }, 600);
      }
    }

    res.status(201).json({
      success: true,
      message: userMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chat threads (Admin only)
// @route   GET /api/chats
// @access  Private/Admin
exports.getAllChats = async (req, res, next) => {
  try {
    const chats = await Chat.find().sort({ lastMessageAt: -1 });
    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single chat with full messages (Admin or Customer)
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      chat,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update chat status (e.g. RESOLVED or CLOSED)
// @route   PUT /api/chats/:chatId/status
// @access  Private/Admin
exports.updateChatStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const chat = await Chat.findByIdAndUpdate(req.params.chatId, { status }, { new: true });
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    next(error);
  }
};
