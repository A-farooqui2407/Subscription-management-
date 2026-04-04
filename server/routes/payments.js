/**
 * Payments — list and detail.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../utils/asyncHandler');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), paymentController.getAllPayments);
router.get('/:id', asyncHandler(verifyToken), paymentController.getPaymentById);

module.exports = router;
