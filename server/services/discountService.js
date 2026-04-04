/**
 * Discount validation, application, and usage accounting.
 */
const Discount = require('../models/Discount');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Today as YYYY-MM-DD for DATEONLY comparison.
 */
function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Validate discount for an order/subscription context.
 * @param {string} discountId
 * @param {number} orderTotal
 * @param {number} totalQty
 * @returns {Promise<import('sequelize').Model>}
 */
async function validateDiscount(discountId, orderTotal, totalQty) {
  const discount = await Discount.findByPk(discountId);
  if (!discount) {
    throw httpError(404, 'Discount not found');
  }

  if (!discount.isActive) {
    throw httpError(400, 'Discount is not active');
  }

  const today = todayDateString();
  const start = String(discount.startDate);
  const end = String(discount.endDate);

  if (today < start) {
    throw httpError(400, 'Discount not yet active');
  }
  if (today > end) {
    throw httpError(400, 'Discount has expired');
  }

  const total = toNumber(orderTotal);
  const qty = Number(totalQty) || 0;
  const minPurchase = toNumber(discount.minPurchase);
  const minQty = Number(discount.minQty) || 0;

  if (total < minPurchase) {
    throw httpError(400, 'Minimum purchase not met');
  }
  if (qty < minQty) {
    throw httpError(400, 'Minimum quantity not met');
  }

  if (discount.limitUsage != null && discount.usedCount >= discount.limitUsage) {
    throw httpError(400, 'Discount usage limit reached');
  }

  return discount;
}

/**
 * Compute discount amount and total after discount.
 * @param {import('sequelize').Model|object} discount
 * @param {number} orderTotal
 * @returns {{ discountAmount: number, finalTotal: number }}
 */
function applyDiscount(discount, orderTotal) {
  const total = toNumber(orderTotal);
  const type = discount.type;
  const value = toNumber(discount.value);

  let discountAmount = 0;
  if (type === 'percentage') {
    discountAmount = (value / 100) * total;
  } else if (type === 'fixed') {
    discountAmount = value;
  } else {
    discountAmount = 0;
  }

  if (discountAmount > total) {
    discountAmount = total;
  }

  const finalTotal = Math.max(0, total - discountAmount);
  return { discountAmount, finalTotal };
}

/**
 * Increment usedCount after successful application.
 * @param {string} discountId
 */
async function incrementUsage(discountId, transaction) {
  const discount = await Discount.findByPk(discountId, { transaction });
  if (!discount) {
    throw httpError(404, 'Discount not found');
  }
  discount.usedCount = (discount.usedCount || 0) + 1;
  await discount.save({ transaction });
  return discount;
}

module.exports = {
  validateDiscount,
  applyDiscount,
  incrementUsage,
};
