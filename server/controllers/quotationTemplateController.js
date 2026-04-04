/**
 * Quotation templates — Admin / InternalUser create/update; Admin-only delete.
 */
const { Op } = require('sequelize');
const QuotationTemplate = require('../models/QuotationTemplate');
const Plan = require('../models/Plan');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const PLAN_ATTRIBUTES = ['id', 'name', 'billingPeriod', 'price'];

async function validateProductLines(productLines) {
  if (!Array.isArray(productLines) || productLines.length < 1) {
    return 'productLines must be a non-empty array';
  }

  const productIds = [];
  const variantIds = [];

  for (let i = 0; i < productLines.length; i += 1) {
    const line = productLines[i];
    if (!line || typeof line !== 'object') {
      return `productLines[${i}] is invalid`;
    }
    const { productId, qty, unitPrice, variantId } = line;
    if (!productId || qty === undefined || qty === null || unitPrice === undefined || unitPrice === null) {
      return `productLines[${i}] requires productId, qty, and unitPrice`;
    }
    const q = parseInt(qty, 10);
    if (Number.isNaN(q) || q < 1) {
      return `productLines[${i}] qty must be a positive integer`;
    }
    const up = Number(unitPrice);
    if (Number.isNaN(up) || up < 0) {
      return `productLines[${i}] unitPrice must be a number >= 0`;
    }
    productIds.push(productId);
    if (variantId) variantIds.push(variantId);
  }

  const uniqueProductIds = [...new Set(productIds.map(String))];
  const uniqueVariantIds = [...new Set(variantIds.map(String))];

  const products = await Product.findAll({ where: { id: { [Op.in]: uniqueProductIds } } });
  const productById = new Map(products.map((p) => [String(p.id), p]));

  const variants =
    uniqueVariantIds.length > 0
      ? await Variant.findAll({ where: { id: { [Op.in]: uniqueVariantIds } } })
      : [];
  const variantById = new Map(variants.map((v) => [String(v.id), v]));

  const missingProducts = uniqueProductIds.filter((id) => !productById.has(id));
  if (missingProducts.length) {
    return `Unknown product id(s): ${missingProducts.join(', ')}`;
  }

  const missingVariants = uniqueVariantIds.filter((id) => !variantById.has(id));
  if (missingVariants.length) {
    return `Unknown variant id(s): ${missingVariants.join(', ')}`;
  }

  for (let i = 0; i < productLines.length; i += 1) {
    const line = productLines[i];
    const { productId, variantId } = line;
    if (variantId) {
      const variant = variantById.get(String(variantId));
      if (String(variant.productId) !== String(productId)) {
        return `productLines[${i}]: variant does not belong to product`;
      }
    }
  }

  return null;
}

const getAllTemplates = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);

  const count = await QuotationTemplate.count();
  const rows = await QuotationTemplate.findAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Plan,
        as: 'plan',
        attributes: PLAN_ATTRIBUTES,
      },
    ],
  });

  const data = rows.map((r) => r.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getTemplateById = asyncHandler(async (req, res) => {
  const template = await QuotationTemplate.findByPk(req.params.id, {
    include: [
      {
        model: Plan,
        as: 'plan',
        attributes: PLAN_ATTRIBUTES,
      },
    ],
  });

  if (!template) {
    return res.error('Template not found', 404);
  }

  const plain = template.get({ plain: true });
  if (typeof plain.productLines === 'string') {
    try {
      plain.productLines = JSON.parse(plain.productLines);
    } catch {
      plain.productLines = [];
    }
  }
  if (!Array.isArray(plain.productLines)) {
    plain.productLines = [];
  }

  return res.success(plain, 'Success', 200);
});

const createTemplate = asyncHandler(async (req, res) => {
  const { name, planId, productLines, validityDays } = req.body;

  if (!name || !planId || productLines === undefined || productLines === null) {
    return res.error('name, planId, and productLines are required', 400);
  }

  const plan = await Plan.findByPk(planId);
  if (!plan) {
    return res.error('Plan not found', 400);
  }

  const lineErr = await validateProductLines(productLines);
  if (lineErr) {
    return res.error(lineErr, 400);
  }

  const template = await QuotationTemplate.create({
    name: String(name).trim(),
    planId,
    productLines,
    validityDays:
      validityDays !== undefined && validityDays !== null
        ? parseInt(validityDays, 10) || 30
        : 30,
    createdBy: req.user.id,
  });

  const created = await QuotationTemplate.findByPk(template.id, {
    include: [{ model: Plan, as: 'plan', attributes: PLAN_ATTRIBUTES }],
  });

  return res.success(created.get({ plain: true }), 'Template created', 201);
});

const updateTemplate = asyncHandler(async (req, res) => {
  const template = await QuotationTemplate.findByPk(req.params.id);
  if (!template) {
    return res.error('Template not found', 404);
  }

  const { name, validityDays, planId, productLines } = req.body;

  if (planId !== undefined) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.error('Plan not found', 400);
    }
    template.planId = planId;
  }

  if (productLines !== undefined) {
    const lineErr = await validateProductLines(productLines);
    if (lineErr) {
      return res.error(lineErr, 400);
    }
    template.productLines = productLines;
  }

  if (name !== undefined) {
    template.name = String(name).trim();
  }
  if (validityDays !== undefined && validityDays !== null) {
    const v = parseInt(validityDays, 10);
    if (Number.isNaN(v) || v < 1) {
      return res.error('validityDays must be a positive integer', 400);
    }
    template.validityDays = v;
  }

  await template.save();

  const updated = await QuotationTemplate.findByPk(template.id, {
    include: [{ model: Plan, as: 'plan', attributes: PLAN_ATTRIBUTES }],
  });

  return res.success(updated.get({ plain: true }), 'Template updated', 200);
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await QuotationTemplate.findByPk(req.params.id);
  if (!template) {
    return res.error('Template not found', 404);
  }

  await template.destroy({ force: true });
  return res.success(null, 'Template deleted successfully', 200);
});

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
