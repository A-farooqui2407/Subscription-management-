/**
 * Payments — record paymentMethod, amount, paymentDate; mark invoice Paid when fully paid.
 */

async function createPayment(req, res, next) {
  // TODO: validate invoice exists; sum payments vs total; update invoice status
  // TODO: track paid vs outstanding per subscription (aggregate invoices/payments)
  res.status(501).json({ message: 'Not implemented' });
}

async function listPayments(req, res, next) {
  // TODO: optional filters (invoiceId, date range)
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createPayment,
  listPayments,
};
