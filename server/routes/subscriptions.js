/**
 * Subscriptions + order lines — status flow; invoice stub on activate.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), subscriptionController.getAllSubscriptions);
router.post('/', asyncHandler(verifyToken), subscriptionController.createSubscription);
router.put('/:id/status', asyncHandler(verifyToken), subscriptionController.updateStatus);
router.get('/:id', asyncHandler(verifyToken), subscriptionController.getSubscriptionById);
router.put('/:id', asyncHandler(verifyToken), subscriptionController.updateSubscription);
router.delete(
  '/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  subscriptionController.deleteSubscription
);

module.exports = router;
