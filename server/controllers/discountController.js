/**
 * Discount CRUD — Admin only; type, value, minPurchase, minQty, dates, usage limits, appliesTo.
 */

async function createDiscount(req, res, next) {
  // TODO: validate body; initialize usedCount
  res.status(501).json({ message: 'Not implemented' });
}

async function listDiscounts(req, res, next) {
  // TODO: list discounts
  res.status(501).json({ message: 'Not implemented' });
}

async function getDiscountById(req, res, next) {
  // TODO: single discount
  res.status(501).json({ message: 'Not implemented' });
}

async function updateDiscount(req, res, next) {
  // TODO: update fields (careful with usedCount)
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteDiscount(req, res, next) {
  // TODO: check subscriptions referencing discount
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createDiscount,
  listDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
};
