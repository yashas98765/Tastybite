const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfileStats,
  redeemReward,
  getUserNotifications,
  markNotificationRead
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/profile-stats', protect, getProfileStats);
router.put('/change-password', protect, changePassword);

router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

router.post('/rewards/redeem', protect, redeemReward);
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

router.post('/wishlist/:foodId', protect, toggleWishlist);

module.exports = router;

