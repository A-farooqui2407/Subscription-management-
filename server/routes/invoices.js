/**
 * Invoices — list/detail/actions (confirm, cancel, send, print, payments).
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), invoiceController.getAllInvoices);
router.put(
  '/:id/confirm',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.confirmInvoice
);
router.put(
  '/:id/cancel',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.cancelInvoice
);
router.post(
  '/:id/send',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.sendInvoice
);
router.get('/:id/print', asyncHandler(verifyToken), invoiceController.printInvoice);
router.post(
  '/:id/payments',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.recordPayment
);
router.get('/:id', asyncHandler(verifyToken), invoiceController.getInvoiceById);

module.exports = router;
