/**
 * Payments — record against invoices.
 */
const express = require('express');
const paymentController = require('../controllers/paymentController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.post('/', paymentController.createPayment);
router.get('/', paymentController.listPayments);

module.exports = router;
