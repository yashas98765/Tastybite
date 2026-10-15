const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const { sendEmail } = require('../services/emailService');

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

router.post('/test-email', protect, async (req, res) => {
  const to = req.body.to || req.user.email || process.env.EMAIL_USER;
  const result = await sendEmail({
    to,
    subject: 'TastyBite Live Mail Verification 🍔',
    html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Hello ${req.user.name || 'Foodie'}!</h2><p>This email confirms that your TastyBite automated email notifications are working perfectly with your Gmail SMTP!</p></div>`
  });
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;
