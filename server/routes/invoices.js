/**
 * Invoices — list/detail/actions (confirm, cancel, send, print, payments).
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const invoiceController = require('../controllers/invoiceController');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), invoiceController.getAllInvoices);
router.put(
  '/:id/confirm',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.confirmInvoice
);
router.put(
  '/:id/cancel',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.cancelInvoice
);
router.post(
  '/:id/send',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.sendInvoice
);
router.get('/:id/print', validateUuid('id'), asyncHandler(verifyToken), invoiceController.printInvoice);
router.post(
  '/:id/payments',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  invoiceController.recordPayment
);
router.get('/:id', validateUuid('id'), asyncHandler(verifyToken), invoiceController.getInvoiceById);

module.exports = router;
