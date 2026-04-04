/**
 * Subscriptions + order lines — status flow Draft → Quotation → Confirmed → Active → Closed.
 * On confirmation: apply discount + tax; auto-invoice when → Active (via invoiceService hook).
 */

async function createSubscription(req, res, next) {
  // TODO: auto-gen subscriptionNumber; link customerId, planId, optional discountId
  res.status(501).json({ message: 'Not implemented' });
}

async function listSubscriptions(req, res, next) {
  // TODO: filters (status, customerId, dates)
  res.status(501).json({ message: 'Not implemented' });
}

async function getSubscriptionById(req, res, next) {
  // TODO: include order lines, plan, customer
  res.status(501).json({ message: 'Not implemented' });
}

async function updateSubscription(req, res, next) {
  // TODO: update allowed fields per status
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteSubscription(req, res, next) {
  // TODO: restrict by status (e.g. Draft only)
  res.status(501).json({ message: 'Not implemented' });
}

async function transitionStatus(req, res, next) {
  // TODO: validate allowed transitions; on Active trigger invoice generation
  res.status(501).json({ message: 'Not implemented' });
}

async function createOrderLine(req, res, next) {
  // TODO: subscriptionId, productId, qty, unitPrice, taxId; compute amount
  res.status(501).json({ message: 'Not implemented' });
}

async function updateOrderLine(req, res, next) {
  // TODO: update line; recalc amount
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteOrderLine(req, res, next) {
  // TODO: delete line
  res.status(501).json({ message: 'Not implemented' });
}

async function confirmSubscription(req, res, next) {
  // TODO: validate discount via discountService.validateDiscount; apply taxes to lines/totals
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  transitionStatus,
  createOrderLine,
  updateOrderLine,
  deleteOrderLine,
  confirmSubscription,
};
