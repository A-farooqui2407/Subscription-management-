/**
 * Plan availability and billing date helpers.
 */
const Plan = require('../models/Plan');

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Parse YYYY-MM-DD to UTC midnight Date.
 * @param {string|Date} input
 */
function parseDateOnly(input) {
  const s = String(input).slice(0, 10);
  const parts = s.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    throw new Error('Invalid date');
  }
  const [y, m, d] = parts;
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Format Date as YYYY-MM-DD (UTC calendar date).
 * @param {Date} d
 */
function formatDateOnly(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Whether the plan exists, is active, and (if dates are set) today falls in range.
 * @param {string} planId
 * @returns {Promise<boolean>}
 */
async function isPlanAvailable(planId) {
  const plan = await Plan.findByPk(planId);
  if (!plan || !plan.isActive) {
    return false;
  }

  const today = todayDateString();
  const start = plan.startDate != null ? String(plan.startDate).slice(0, 10) : null;
  const end = plan.endDate != null ? String(plan.endDate).slice(0, 10) : null;

  if (start && end) {
    return today >= start && today <= end;
  }
  if (start) {
    return today >= start;
  }
  if (end) {
    return today <= end;
  }

  return true;
}

/**
 * Next billing anchor date after startDate for the given period (UTC date arithmetic).
 * @param {string|Date} startDate — DATEONLY or ISO date string
 * @param {'daily'|'weekly'|'monthly'|'yearly'} billingPeriod
 * @returns {string} YYYY-MM-DD
 */
function calculateNextBillingDate(startDate, billingPeriod) {
  const d = parseDateOnly(startDate);

  switch (billingPeriod) {
    case 'daily':
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case 'weekly':
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case 'monthly':
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case 'yearly':
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      break;
    default:
      throw new Error(`Invalid billingPeriod: ${billingPeriod}`);
  }

  return formatDateOnly(d);
}

module.exports = {
  isPlanAvailable,
  calculateNextBillingDate,
  parseDateOnly,
  formatDateOnly,
};
