/**
 * Invoice generation — triggered when subscription becomes Active; totals from order lines, tax, discount.
 */

/**
 * Create draft invoice for a subscription (customer snapshot, lines, taxes, totals).
 * @param {import('sequelize').Model} subscription
 */
async function generateInvoiceForSubscription(subscription) {
  // TODO: load subscription with order lines, taxes, contact; compute subtotal, tax, total
  // TODO: set status Draft, dueDate from payment terms
}

/**
 * Recalculate invoice amounts from persisted lines (after line edits).
 * @param {import('sequelize').Model} invoice
 */
async function recalculateInvoiceTotals(invoice) {
  // TODO: sum lines + tax; update invoice.subtotal, tax, total
}

/**
 * After payment recorded: if sum(payments) >= total, set invoice status Paid.
 * @param {import('sequelize').Model} invoice
 */
async function syncInvoicePaidStatus(invoice) {
  // TODO: aggregate Payment rows; update status
}

module.exports = {
  generateInvoiceForSubscription,
  recalculateInvoiceTotals,
  syncInvoicePaidStatus,
};
