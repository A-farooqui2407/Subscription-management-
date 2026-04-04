/**
 * Subscriptions + order lines — status flow; invoice stub on activate.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/', verifyToken, subscriptionController.getAllSubscriptions);
router.post('/', verifyToken, subscriptionController.createSubscription);
router.put('/:id/status', verifyToken, subscriptionController.updateStatus);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);
router.put('/:id', verifyToken, subscriptionController.updateSubscription);
router.delete(
  '/:id',
  verifyToken,
  checkRole('Admin'),
  subscriptionController.deleteSubscription
);

module.exports = router;
