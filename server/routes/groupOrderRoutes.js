const express = require('express');
const router = express.Router();
const {
  createGroupOrder,
  getGroupByCode,
  joinGroupOrder,
  addItemToGroup,
  removeItemFromGroup,
  lockGroupOrder,
  finalizeGroupOrder
} = require('../controllers/groupOrderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', protect, createGroupOrder);
router.get('/:code', optionalProtect, getGroupByCode);
router.post('/:code/join', optionalProtect, joinGroupOrder);
router.post('/:code/items', optionalProtect, addItemToGroup);
router.delete('/:code/items/:itemId', optionalProtect, removeItemFromGroup);
router.put('/:code/lock', protect, lockGroupOrder);
router.post('/:code/checkout', protect, finalizeGroupOrder);

module.exports = router;
