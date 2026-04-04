/**
 * Dashboard + reports — KPIs and filtered reporting (overdue = dueDate < today, unpaid).
 */

async function getDashboard(req, res, next) {
  // TODO: active subscriptions count, total revenue, pending payments, overdue invoices
  res.status(501).json({ message: 'Not implemented' });
}

async function getReports(req, res, next) {
  // TODO: query params startDate, endDate, status, customerId — subscriptions/invoices/payments
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  getDashboard,
  getReports,
};
