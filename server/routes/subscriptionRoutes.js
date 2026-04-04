/**
 * Subscriptions + nested order lines + status / confirm flows.
 */
const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.listSubscriptions);
// Nested paths before `/:id` to avoid capturing reserved segments as ids.
router.patch('/order-lines/:orderLineId', subscriptionController.updateOrderLine);
router.delete('/order-lines/:orderLineId', subscriptionController.deleteOrderLine);
router.post('/:id/status', subscriptionController.transitionStatus);
router.post('/:id/confirm', subscriptionController.confirmSubscription);
router.post('/:subscriptionId/order-lines', subscriptionController.createOrderLine);
router.get('/:id', subscriptionController.getSubscriptionById);
router.patch('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
