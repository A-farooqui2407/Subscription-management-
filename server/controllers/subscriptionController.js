/**
 * Subscriptions + order lines — status flow draft → quotation → confirmed → active → closed.
 */
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Subscription = require('../models/Subscription');
const OrderLine = require('../models/OrderLine');
const Contact = require('../models/Contact');
const Plan = require('../models/Plan');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const Tax = require('../models/Tax');
const QuotationTemplate = require('../models/QuotationTemplate');
const Discount = require('../models/Discount');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const planService = require('../services/planService');
const discountService = require('../services/discountService');
const { generateInvoice } = require('../services/invoiceService');

const STATUSES = ['draft', 'quotation', 'confirmed', 'active', 'closed'];

const TRANSITIONS = {
  draft: ['quotation'],
  quotation: ['confirmed'],
  confirmed: ['active'],
  active: ['closed'],
};

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function subscriptionIncludeList() {
  return [
    { model: Contact, as: 'customer', attributes: ['id', 'name', 'email'] },
    { model: Plan, as: 'plan', attributes: ['id', 'name', 'billingPeriod', 'price'] },
    {
      model: Discount,
      as: 'discount',
      required: false,
      attributes: ['id', 'name', 'type', 'value'],
    },
    {
      model: OrderLine,
      as: 'orderLines',
      attributes: ['id', 'productId', 'qty', 'unitPrice', 'taxAmount', 'amount'],
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
    },
  ];
}

function subscriptionIncludeDetail() {
  return [
    {
      model: Contact,
      as: 'customer',
      attributes: ['id', 'name', 'email', 'phone', 'type'],
    },
    { model: Plan, as: 'plan', attributes: ['id', 'name', 'billingPeriod', 'price', 'minQty'] },
    {
      model: Discount,
      as: 'discount',
      required: false,
      attributes: ['id', 'name', 'type', 'value', 'appliesTo'],
    },
    {
      model: User,
      as: 'creator',
      required: false,
      attributes: ['id', 'name', 'email'],
    },
    {
      model: OrderLine,
      as: 'orderLines',
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'productType', 'salesPrice'],
        },
        {
          model: Tax,
          as: 'tax',
          required: false,
          attributes: ['id', 'name', 'percentage', 'type'],
        },
        { model: Variant, as: 'variant', required: false },
      ],
    },
  ];
}

async function fetchSubscriptionDetail(id) {
  return Subscription.findByPk(id, { include: subscriptionIncludeDetail() });
}

async function recalculateSubscriptionTotals(subscriptionId, transaction) {
  const lines = await OrderLine.findAll({ where: { subscriptionId }, transaction });
  let subtotal = 0;
  let taxSum = 0;
  for (const line of lines) {
    subtotal += Number(line.qty) * Number(line.unitPrice);
    taxSum += Number(line.taxAmount || 0);
  }
  const sub = await Subscription.findByPk(subscriptionId, { transaction });
  const disc = Number(sub.discountAmount || 0);
  sub.subtotal = subtotal;
  sub.taxAmount = taxSum;
  sub.total = Math.max(0, subtotal + taxSum - disc);
  await sub.save({ transaction });
  return sub;
}

async function validateLineItems(lines, transaction) {
  if (!Array.isArray(lines) || lines.length < 1) {
    return 'Lines must be a non-empty array';
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || typeof line !== 'object') {
      return `Line ${i} is invalid`;
    }
    const { productId, qty, unitPrice, variantId, taxId } = line;
    if (!productId || qty === undefined || qty === null || unitPrice === undefined || unitPrice === null) {
      return `Line ${i} requires productId, qty, and unitPrice`;
    }
    const q = parseInt(qty, 10);
    if (Number.isNaN(q) || q < 1) {
      return `Line ${i}: qty must be a positive integer`;
    }
    const up = Number(unitPrice);
    if (Number.isNaN(up) || up < 0) {
      return `Line ${i}: unitPrice must be >= 0`;
    }

    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      return `Line ${i}: product not found`;
    }

    if (variantId) {
      const variant = await Variant.findByPk(variantId, { transaction });
      if (!variant) {
        return `Line ${i}: variant not found`;
      }
      if (String(variant.productId) !== String(productId)) {
        return `Line ${i}: variant does not belong to product`;
      }
    }

    if (taxId) {
      const tax = await Tax.findByPk(taxId, { transaction });
      if (!tax) {
        return `Line ${i}: tax not found`;
      }
    }
  }

  return null;
}

async function createOrderLinesFromInput(subscriptionId, lines, transaction) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const { productId, qty, unitPrice, variantId, taxId } = line;
    const q = parseInt(qty, 10);
    const up = Number(unitPrice);

    let taxPercent = 0;
    if (taxId) {
      const tax = await Tax.findByPk(taxId, { transaction });
      taxPercent = Number(tax.percentage);
    }

    const lineSub = q * up;
    const taxAmount = (lineSub * taxPercent) / 100;
    const amount = lineSub + taxAmount;

    await OrderLine.create(
      {
        subscriptionId,
        productId,
        variantId: variantId || null,
        taxId: taxId || null,
        qty: q,
        unitPrice: up,
        taxPercent,
        taxAmount,
        amount,
      },
      { transaction }
    );
  }
}

const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  if (req.query.status !== undefined && req.query.status !== '') {
    if (!STATUSES.includes(req.query.status)) {
      return res.error('Invalid status filter', 400);
    }
    where.status = req.query.status;
  }

  if (req.query.customerId !== undefined && req.query.customerId !== '') {
    where.customerId = req.query.customerId;
  }

  const count = await Subscription.count({ where });
  const rows = await Subscription.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: subscriptionIncludeList(),
  });

  const data = rows.map((r) => r.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getSubscriptionById = asyncHandler(async (req, res) => {
  const sub = await fetchSubscriptionDetail(req.params.id);
  if (!sub) {
    return res.error('Subscription not found', 404);
  }
  return res.success(sub.get({ plain: true }), 'Success', 200);
});

const createSubscription = asyncHandler(async (req, res) => {
  const {
    customerId,
    planId,
    startDate,
    templateId,
    orderLines,
    discountId,
    paymentTerms,
  } = req.body;

  if (!customerId || !planId || !startDate) {
    return res.error('customerId, planId, and startDate are required', 400);
  }

  const customer = await Contact.findByPk(customerId);
  if (!customer) {
    return res.error('Customer not found', 404);
  }

  const plan = await Plan.findByPk(planId);
  if (!plan) {
    return res.error('Plan not found', 404);
  }

  const available = await planService.isPlanAvailable(planId);
  if (!available) {
    return res.error('Plan is not available', 400);
  }

  if (discountId) {
    const disc = await Discount.findByPk(discountId);
    if (!disc) {
      return res.error('Discount not found', 404);
    }
  }

  let linesToBuild = orderLines;
  if (templateId) {
    const template = await QuotationTemplate.findByPk(templateId);
    if (!template) {
      return res.error('Template not found', 404);
    }
    linesToBuild = template.productLines;
  }

  if (!linesToBuild || !Array.isArray(linesToBuild) || linesToBuild.length < 1) {
    return res.error('orderLines or a valid templateId with productLines is required', 400);
  }

  let expirationDate;
  try {
    expirationDate = planService.calculateNextBillingDate(startDate, plan.billingPeriod);
  } catch {
    return res.error('Could not calculate expiration from plan billing period', 400);
  }

  let newSubscriptionId;
  const t = await sequelize.transaction();
  try {
    const lineErr = await validateLineItems(linesToBuild, t);
    if (lineErr) {
      await t.rollback();
      return res.error(lineErr, 400);
    }

    const sub = await Subscription.create(
      {
        customerId,
        planId,
        discountId: discountId || null,
        startDate,
        expirationDate,
        paymentTerms: paymentTerms != null ? String(paymentTerms) : null,
        status: 'draft',
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        createdBy: req.user.id,
      },
      { transaction: t }
    );

    await createOrderLinesFromInput(sub.id, linesToBuild, t);
    await recalculateSubscriptionTotals(sub.id, t);

    newSubscriptionId = sub.id;
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  const created = await fetchSubscriptionDetail(newSubscriptionId);
  return res.success(created.get({ plain: true }), 'Subscription created', 201);
});

const updateSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findByPk(req.params.id, {
    include: [{ model: OrderLine, as: 'orderLines' }],
  });
  if (!sub) {
    return res.error('Subscription not found', 404);
  }

  if (!['draft', 'quotation'].includes(sub.status)) {
    return res.error('Cannot edit confirmed or active subscription', 400);
  }

  const {
    customerId,
    planId,
    startDate,
    expirationDate,
    paymentTerms,
    discountId,
    orderLines,
  } = req.body;

  const t = await sequelize.transaction();
  try {
    if (customerId !== undefined) {
      const c = await Contact.findByPk(customerId, { transaction: t });
      if (!c) {
        await t.rollback();
        return res.error('Customer not found', 404);
      }
      sub.customerId = customerId;
    }

    if (planId !== undefined) {
      const p = await Plan.findByPk(planId, { transaction: t });
      if (!p) {
        await t.rollback();
        return res.error('Plan not found', 404);
      }
      const ok = await planService.isPlanAvailable(planId);
      if (!ok) {
        await t.rollback();
        return res.error('Plan is not available', 400);
      }
      sub.planId = planId;
    }

    if (discountId !== undefined) {
      if (discountId === null || discountId === '') {
        sub.discountId = null;
      } else {
        const d = await Discount.findByPk(discountId, { transaction: t });
        if (!d) {
          await t.rollback();
          return res.error('Discount not found', 404);
        }
        sub.discountId = discountId;
      }
    }

    if (startDate !== undefined) {
      sub.startDate = startDate;
    }
    if (expirationDate !== undefined) {
      sub.expirationDate = expirationDate || null;
    }
    if (paymentTerms !== undefined) {
      sub.paymentTerms = paymentTerms != null ? String(paymentTerms) : null;
    }

    if (orderLines !== undefined) {
      const lineErr = await validateLineItems(orderLines, t);
      if (lineErr) {
        await t.rollback();
        return res.error(lineErr, 400);
      }
      await OrderLine.destroy({ where: { subscriptionId: sub.id }, transaction: t });
      await createOrderLinesFromInput(sub.id, orderLines, t);
    }

    await sub.save({ transaction: t });
    await recalculateSubscriptionTotals(sub.id, t);

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  const updated = await fetchSubscriptionDetail(sub.id);
  return res.success(updated.get({ plain: true }), 'Subscription updated', 200);
});

const updateStatus = asyncHandler(async (req, res, next) => {
  const sub = await Subscription.findByPk(req.params.id, {
    include: [{ model: OrderLine, as: 'orderLines' }],
  });
  if (!sub) {
    return res.error('Subscription not found', 404);
  }

  const newStatus = req.body.status;
  if (!newStatus || !STATUSES.includes(newStatus)) {
    return res.error('Valid status is required', 400);
  }

  const allowed = TRANSITIONS[sub.status] || [];
  if (!allowed.includes(newStatus)) {
    return res.error('Invalid status transition', 400);
  }

  const t = await sequelize.transaction();
  try {
    if (newStatus === 'confirmed') {
      await recalculateSubscriptionTotals(sub.id, t);
      await sub.reload({ include: [{ model: OrderLine, as: 'orderLines' }], transaction: t });

      if (sub.discountId) {
        const totalQty = sub.orderLines.reduce((sum, l) => sum + Number(l.qty), 0);
        const subtotalVal = Number(sub.subtotal);

        try {
          await discountService.validateDiscount(sub.discountId, subtotalVal, totalQty);
        } catch (err) {
          await t.rollback();
          return next(err);
        }

        const disc = await Discount.findByPk(sub.discountId, { transaction: t });
        if (!disc || disc.appliesTo !== 'subscriptions') {
          await t.rollback();
          return res.error('Discount does not apply to subscriptions', 400);
        }

        const { discountAmount } = discountService.applyDiscount(disc, subtotalVal);
        sub.discountAmount = discountAmount;
        sub.total = Math.max(
          0,
          subtotalVal - discountAmount + Number(sub.taxAmount)
        );
        await sub.save({ transaction: t });
        await discountService.incrementUsage(sub.discountId, t);
      }
    }

    sub.status = newStatus;
    await sub.save({ transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  if (newStatus === 'active') {
    const forInvoice = await Subscription.findByPk(sub.id, {
      include: [{ model: OrderLine, as: 'orderLines' }],
    });
    await generateInvoice(forInvoice);
  }

  const out = await fetchSubscriptionDetail(req.params.id);
  return res.success(out.get({ plain: true }), 'Status updated', 200);
});

const deleteSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findByPk(req.params.id);
  if (!sub) {
    return res.error('Subscription not found', 404);
  }

  if (!['draft', 'quotation'].includes(sub.status)) {
    return res.error('Cannot delete active or confirmed subscription', 400);
  }

  await sub.destroy();
  return res.success(null, 'Subscription deleted successfully', 200);
});

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  updateStatus,
  deleteSubscription,
};
