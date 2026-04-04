/**
 * Plan CRUD — reads for authenticated users; writes Admin-only (routes).
 */
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const BILLING_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

/** Block delete when subscriptions are in these statuses (case-insensitive match). */
const BLOCKING_SUBSCRIPTION_STATUSES = ['active', 'confirmed'];

function toNum(v, fallback = null) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function toInt(v, fallback = null) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = String(startDate).slice(0, 10);
  const end = String(endDate).slice(0, 10);
  if (start >= end) {
    return 'startDate must be before endDate';
  }
  return null;
}

async function loadSubscriptionCountsByPlanIds(planIds) {
  if (!planIds.length) {
    return new Map();
  }

  const placeholders = planIds.map((_id, i) => `$${i + 1}`).join(', ');
  const rows = await sequelize.query(
    `SELECT plan_id AS "planId", COUNT(*)::int AS "subscriptionCount"
     FROM subscriptions
     WHERE deleted_at IS NULL AND plan_id IN (${placeholders})
     GROUP BY plan_id`,
    { bind: planIds, type: QueryTypes.SELECT }
  );

  const map = new Map();
  for (const row of rows) {
    map.set(String(row.planId), Number(row.subscriptionCount || 0));
  }
  return map;
}

const getAllPlans = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  if (req.query.isActive === 'true') {
    where.isActive = true;
  } else if (req.query.isActive === 'false') {
    where.isActive = false;
  }

  if (req.query.billingPeriod !== undefined && req.query.billingPeriod !== '') {
    if (!BILLING_PERIODS.includes(req.query.billingPeriod)) {
      return res.error('Invalid billingPeriod filter', 400);
    }
    where.billingPeriod = req.query.billingPeriod;
  }

  if (req.query.search !== undefined && req.query.search !== '') {
    where.name = { [Op.iLike]: `%${String(req.query.search).trim()}%` };
  }

  const count = await Plan.count({ where });
  const rows = await Plan.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const planIds = rows.map((p) => p.id);
  const subCounts = await loadSubscriptionCountsByPlanIds(planIds);

  const data = rows.map((p) => {
    const plain = p.get({ plain: true });
    plain.subscriptionCount = subCounts.get(String(p.id)) ?? 0;
    return plain;
  });

  return res.paginated(data, count, page, limit);
});

const getPlanById = asyncHandler(async (req, res) => {
  const plan = await Plan.findByPk(req.params.id);
  if (!plan) {
    return res.error('Plan not found', 404);
  }

  const subscriptionCount = await Subscription.count({
    where: { planId: plan.id },
  });

  const plain = plan.get({ plain: true });
  plain.subscriptionCount = subscriptionCount;

  return res.success(plain, 'Success', 200);
});

const createPlan = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    billingPeriod,
    minQty,
    startDate,
    endDate,
    autoClose,
    closable,
    pausable,
    renewable,
    isActive,
  } = req.body;

  if (!name || price === undefined || price === null || price === '' || !billingPeriod) {
    return res.error('name, price, and billingPeriod are required', 400);
  }

  if (!BILLING_PERIODS.includes(billingPeriod)) {
    return res.error('billingPeriod must be daily, weekly, monthly, or yearly', 400);
  }

  const priceNum = toNum(price);
  if (priceNum === null || priceNum < 0) {
    return res.error('price must be greater than or equal to 0', 400);
  }

  const rangeErr = validateDateRange(startDate, endDate);
  if (rangeErr) {
    return res.error(rangeErr, 400);
  }

  const mq = minQty !== undefined ? toInt(minQty, 1) : 1;
  if (mq === null || mq < 1) {
    return res.error('minQty must be at least 1', 400);
  }

  const plan = await Plan.create({
    name: String(name).trim(),
    price: priceNum,
    billingPeriod,
    minQty: mq,
    startDate: startDate || null,
    endDate: endDate || null,
    autoClose: autoClose !== undefined ? Boolean(autoClose) : false,
    closable: closable !== undefined ? Boolean(closable) : true,
    pausable: pausable !== undefined ? Boolean(pausable) : true,
    renewable: renewable !== undefined ? Boolean(renewable) : true,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdBy: req.user.id,
  });

  return res.success(plan.get({ plain: true }), 'Plan created', 201);
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByPk(req.params.id);
  if (!plan) {
    return res.error('Plan not found', 404);
  }

  const mergedStart =
    req.body.startDate !== undefined ? req.body.startDate : plan.startDate;
  const mergedEnd = req.body.endDate !== undefined ? req.body.endDate : plan.endDate;

  if (mergedStart && mergedEnd) {
    const rangeErr = validateDateRange(mergedStart, mergedEnd);
    if (rangeErr) {
      return res.error(rangeErr, 400);
    }
  }

  const {
    name,
    price,
    billingPeriod,
    minQty,
    startDate,
    endDate,
    autoClose,
    closable,
    pausable,
    renewable,
    isActive,
  } = req.body;

  if (name !== undefined) {
    plan.name = String(name).trim();
  }
  if (price !== undefined) {
    const priceNum = toNum(price);
    if (priceNum === null || priceNum < 0) {
      return res.error('price must be greater than or equal to 0', 400);
    }
    plan.price = priceNum;
  }
  if (billingPeriod !== undefined) {
    if (!BILLING_PERIODS.includes(billingPeriod)) {
      return res.error('billingPeriod must be daily, weekly, monthly, or yearly', 400);
    }
    plan.billingPeriod = billingPeriod;
  }
  if (minQty !== undefined) {
    const mq = toInt(minQty, 1);
    if (mq === null || mq < 1) {
      return res.error('minQty must be at least 1', 400);
    }
    plan.minQty = mq;
  }
  if (startDate !== undefined) {
    plan.startDate = startDate || null;
  }
  if (endDate !== undefined) {
    plan.endDate = endDate || null;
  }
  if (autoClose !== undefined) {
    plan.autoClose = Boolean(autoClose);
  }
  if (closable !== undefined) {
    plan.closable = Boolean(closable);
  }
  if (pausable !== undefined) {
    plan.pausable = Boolean(pausable);
  }
  if (renewable !== undefined) {
    plan.renewable = Boolean(renewable);
  }
  if (isActive !== undefined) {
    plan.isActive = Boolean(isActive);
  }

  await plan.save();
  return res.success(plan.get({ plain: true }), 'Plan updated', 200);
});

const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByPk(req.params.id);
  if (!plan) {
    return res.error('Plan not found', 404);
  }

  const blocking = await Subscription.count({
    where: {
      planId: plan.id,
      status: { [Op.in]: BLOCKING_SUBSCRIPTION_STATUSES },
    },
  });

  if (blocking > 0) {
    return res.error('Cannot delete plan with active subscriptions', 400);
  }

  await plan.destroy();
  return res.success(null, 'Plan deleted successfully', 200);
});

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
