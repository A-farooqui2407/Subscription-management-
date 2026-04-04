/**
 * Payments — list and detail.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../utils/asyncHandler');
const paymentController = require('../controllers/paymentController');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), paymentController.getAllPayments);
router.get('/:id', validateUuid('id'), asyncHandler(verifyToken), paymentController.getPaymentById);

module.exports = router;
