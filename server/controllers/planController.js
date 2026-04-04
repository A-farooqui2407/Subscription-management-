/**
 * Plan CRUD — price, billingPeriod, minQty, dates, option flags (autoClose, closable, pausable, renewable).
 */

async function createPlan(req, res, next) {
  // TODO: validate plan payload
  res.status(501).json({ message: 'Not implemented' });
}

async function listPlans(req, res, next) {
  // TODO: list plans (filter active window if needed)
  res.status(501).json({ message: 'Not implemented' });
}

async function getPlanById(req, res, next) {
  // TODO: single plan
  res.status(501).json({ message: 'Not implemented' });
}

async function updatePlan(req, res, next) {
  // TODO: update plan
  res.status(501).json({ message: 'Not implemented' });
}

async function deletePlan(req, res, next) {
  // TODO: check templates/subscriptions
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
