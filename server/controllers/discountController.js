/**
 * Discount CRUD — Admin only (routes).
 */
const { Op } = require('sequelize');
const Discount = require('../models/Discount');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');

const APPLIES_TO = ['products', 'subscriptions'];
const DISCOUNT_TYPES = ['fixed', 'percentage'];

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

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

/**
 * @param {object} payload — merged fields to validate (create or post-merge update)
 */
function validateDiscountBusinessRules(payload) {
  const {
    type,
    value,
    startDate,
    endDate,
    minPurchase,
    minQty,
    limitUsage,
    appliesTo,
  } = payload;

  if (!type || !DISCOUNT_TYPES.includes(type)) {
    return 'type must be fixed or percentage';
  }
  if (!appliesTo || !APPLIES_TO.includes(appliesTo)) {
    return 'appliesTo must be products or subscriptions';
  }
  if (!startDate || !endDate) {
    return 'startDate and endDate are required';
  }

  const start = String(startDate);
  const end = String(endDate);
  if (start >= end) {
    return 'startDate must be before endDate';
  }

  const val = toNum(value);
  if (val === null || val <= 0) {
    return 'value must be greater than 0';
  }
  if (type === 'percentage' && val > 100) {
    return 'percentage value must be at most 100';
  }

  if (minPurchase !== undefined && minPurchase !== null) {
    const mp = toNum(minPurchase, 0);
    if (mp === null || mp < 0) {
      return 'minPurchase must be >= 0';
    }
  }
  if (minQty !== undefined && minQty !== null) {
    const mq = toInt(minQty, 0);
    if (mq === null || mq < 0) {
      return 'minQty must be >= 0';
    }
  }
  if (limitUsage !== undefined && limitUsage !== null && limitUsage !== '') {
    const lu = toInt(limitUsage);
    if (lu === null || lu < 1) {
      return 'limitUsage must be a positive integer or null';
    }
  }

  return null;
}

const getAllDiscounts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  const { appliesTo, isActive } = req.query;
  if (appliesTo !== undefined && appliesTo !== '') {
    if (!APPLIES_TO.includes(appliesTo)) {
      return res.error('Invalid appliesTo filter', 400);
    }
    where.appliesTo = appliesTo;
  }
  if (isActive === 'true') {
    where.isActive = true;
  } else if (isActive === 'false') {
    where.isActive = false;
  }

  const count = await Discount.count({ where });
  const rows = await Discount.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const data = rows.map((d) => d.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getDiscountById = asyncHandler(async (req, res) => {
  const discount = await Discount.findByPk(req.params.id);
  if (!discount) {
    return res.error('Discount not found', 404);
  }
  return res.success(discount.get({ plain: true }), 'Success', 200);
});

const createDiscount = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    value,
    startDate,
    endDate,
    appliesTo,
    minPurchase,
    minQty,
    limitUsage,
  } = req.body;

  if (!name || !type || value === undefined || value === null || value === '' || !startDate || !endDate || !appliesTo) {
    return res.error(
      'name, type, value, startDate, endDate, and appliesTo are required',
      400
    );
  }

  const payload = {
    type,
    value,
    startDate,
    endDate,
    appliesTo,
    minPurchase: minPurchase !== undefined ? minPurchase : 0,
    minQty: minQty !== undefined ? minQty : 0,
    limitUsage: limitUsage === '' ? null : limitUsage,
  };

  const errMsg = validateDiscountBusinessRules(payload);
  if (errMsg) {
    return res.error(errMsg, 400);
  }

  const discount = await Discount.create({
    name: String(name).trim(),
    type,
    value: toNum(value),
    minPurchase: toNum(minPurchase, 0) ?? 0,
    minQty: toInt(minQty, 0) ?? 0,
    startDate,
    endDate,
    limitUsage:
      limitUsage === undefined || limitUsage === null || limitUsage === ''
        ? null
        : toInt(limitUsage),
    usedCount: 0,
    appliesTo,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    createdBy: req.user.id,
  });

  return res.success(discount.get({ plain: true }), 'Discount created', 201);
});

const updateDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findByPk(req.params.id);
  if (!discount) {
    return res.error('Discount not found', 404);
  }

  const merged = {
    type: req.body.type !== undefined ? req.body.type : discount.type,
    value: req.body.value !== undefined ? req.body.value : discount.value,
    startDate: req.body.startDate !== undefined ? req.body.startDate : discount.startDate,
    endDate: req.body.endDate !== undefined ? req.body.endDate : discount.endDate,
    appliesTo: req.body.appliesTo !== undefined ? req.body.appliesTo : discount.appliesTo,
    minPurchase:
      req.body.minPurchase !== undefined ? req.body.minPurchase : discount.minPurchase,
    minQty: req.body.minQty !== undefined ? req.body.minQty : discount.minQty,
    limitUsage:
      req.body.limitUsage !== undefined ? req.body.limitUsage : discount.limitUsage,
  };

  const errMsg = validateDiscountBusinessRules({
    ...merged,
    limitUsage:
      merged.limitUsage === '' || merged.limitUsage === undefined
        ? null
        : merged.limitUsage,
  });
  if (errMsg) {
    return res.error(errMsg, 400);
  }

  const { name, type, value, minPurchase, minQty, startDate, endDate, limitUsage, appliesTo, isActive } =
    req.body;

  if (name !== undefined) {
    discount.name = String(name).trim();
  }
  if (type !== undefined) {
    discount.type = type;
  }
  if (value !== undefined) {
    discount.value = toNum(value);
  }
  if (minPurchase !== undefined) {
    discount.minPurchase = toNum(minPurchase, 0) ?? 0;
  }
  if (minQty !== undefined) {
    discount.minQty = toInt(minQty, 0) ?? 0;
  }
  if (startDate !== undefined) {
    discount.startDate = startDate;
  }
  if (endDate !== undefined) {
    discount.endDate = endDate;
  }
  if (limitUsage !== undefined) {
    discount.limitUsage =
      limitUsage === null || limitUsage === '' ? null : toInt(limitUsage);
  }
  if (appliesTo !== undefined) {
    discount.appliesTo = appliesTo;
  }
  if (isActive !== undefined) {
    discount.isActive = Boolean(isActive);
  }

  await discount.save();
  return res.success(discount.get({ plain: true }), 'Discount updated', 200);
});

const deleteDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findByPk(req.params.id);
  if (!discount) {
    return res.error('Discount not found', 404);
  }

  const activeLinks = await Subscription.count({
    where: {
      discountId: discount.id,
      status: { [Op.in]: ['active', 'confirmed'] },
    },
  });

  if (activeLinks > 0) {
    return res.error('Cannot delete discount linked to active or confirmed subscriptions', 400);
  }

  await discount.destroy();
  return res.success(null, 'Discount deleted successfully', 200);
});

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
};
