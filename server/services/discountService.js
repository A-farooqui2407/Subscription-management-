/**
 * Discount validation — date range, usage limits, min purchase/qty, appliesTo rules.
 */

/**
 * Validate whether a discount can be applied to a subscription / cart context.
 * @param {object} discount - Discount model instance or plain object
 * @param {object} context - e.g. { purchaseTotal, itemQty, now, customerId, productIds }
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateDiscount(discount, context) {
  // TODO: check startDate/endDate vs context.now or new Date()
  // TODO: if limitUsage set, compare usedCount
  // TODO: enforce minPurchase, minQty
  // TODO: enforce appliesTo (products/plans/categories as designed)
  return { valid: false, reason: 'Not implemented' };
}

module.exports = {
  validateDiscount,
};
