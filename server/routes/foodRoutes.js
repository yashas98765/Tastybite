const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
  toggleAvailability
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/categories', getCategories);
router.get('/', getAllFoods);
router.get('/:id', getFoodById);

router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);
router.patch('/:id/toggle-availability', protect, adminOnly, toggleAvailability);

module.exports = router;
