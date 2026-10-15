const express = require('express');
const router = express.Router();
const {
  getMyChat,
  sendMessage,
  getAllChats,
  getChatById,
  updateChatStatus
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/my-chat', protect, getMyChat);
router.post('/:chatId/messages', protect, sendMessage);

router.get('/', protect, adminOnly, getAllChats);
router.get('/:chatId', protect, getChatById);
router.put('/:chatId/status', protect, adminOnly, updateChatStatus);

module.exports = router;
