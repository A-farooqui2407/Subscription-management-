/**
 * Invoices — list/detail/actions (confirm, cancel, send, print, payments).
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', verifyToken, invoiceController.getAllInvoices);
router.put(
  '/:id/confirm',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  invoiceController.confirmInvoice
);
router.put(
  '/:id/cancel',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  invoiceController.cancelInvoice
);
router.post(
  '/:id/send',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  invoiceController.sendInvoice
);
router.get('/:id/print', verifyToken, invoiceController.printInvoice);
router.post(
  '/:id/payments',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  invoiceController.recordPayment
);
router.get('/:id', verifyToken, invoiceController.getInvoiceById);

module.exports = router;
