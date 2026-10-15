const express = require('express');
const router = express.Router();
const { getSmartPicks } = require('../controllers/recommendationController');

// GET /api/recommendations/smart-picks
router.get('/smart-picks', getSmartPicks);

module.exports = router;
