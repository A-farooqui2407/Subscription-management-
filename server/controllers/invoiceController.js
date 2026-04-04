/**
 * Invoices — Draft → Confirmed → Paid; confirm, cancel, send (email), print (PDF).
 */

async function listInvoices(req, res, next) {
  // TODO: filters (subscriptionId, status, overdue)
  res.status(501).json({ message: 'Not implemented' });
}

async function getInvoiceById(req, res, next) {
  // TODO: include lines/customer snapshot as needed
  res.status(501).json({ message: 'Not implemented' });
}

async function confirmInvoice(req, res, next) {
  // TODO: Draft → Confirmed
  res.status(501).json({ message: 'Not implemented' });
}

async function cancelInvoice(req, res, next) {
  // TODO: set cancelled status / rules
  res.status(501).json({ message: 'Not implemented' });
}

async function sendInvoiceEmail(req, res, next) {
  // TODO: use emailService to send invoice to customer
  res.status(501).json({ message: 'Not implemented' });
}

async function printInvoicePdf(req, res, next) {
  // TODO: generate PDF stream or URL
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  listInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  sendInvoiceEmail,
  printInvoicePdf,
};
