/**
 * Invoices — list/detail/actions (confirm, cancel, send, print).
 */
const express = require('express');
const invoiceController = require('../controllers/invoiceController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/:id/confirm', invoiceController.confirmInvoice);
router.post('/:id/cancel', invoiceController.cancelInvoice);
router.post('/:id/send', invoiceController.sendInvoiceEmail);
router.get('/:id/print', invoiceController.printInvoicePdf);

module.exports = router;
