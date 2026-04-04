/**
 * Payments — list and detail.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/', verifyToken, paymentController.getAllPayments);
router.get('/:id', verifyToken, paymentController.getPaymentById);

module.exports = router;
