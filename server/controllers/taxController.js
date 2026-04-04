/**
 * Tax CRUD — list/read for authenticated users; writes Admin-only (routes).
 */
const OrderLine = require('../models/OrderLine');
const Tax = require('../models/Tax');
const asyncHandler = require('../utils/asyncHandler');

function parsePercentage(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}

const getAllTaxes = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.isActive === 'true') {
    where.isActive = true;
  } else if (req.query.isActive === 'false') {
    where.isActive = false;
  } else {
    where.isActive = true;
  }

  const taxes = await Tax.findAll({
    where,
    order: [['name', 'ASC']],
  });

  return res.success(
    taxes.map((t) => t.get({ plain: true })),
    'Success',
    200
  );
});

const getTaxById = asyncHandler(async (req, res) => {
  const tax = await Tax.findByPk(req.params.id);
  if (!tax) {
    return res.error('Tax not found', 404);
  }
  return res.success(tax.get({ plain: true }), 'Success', 200);
});

const createTax = asyncHandler(async (req, res) => {
  const { name, percentage, type } = req.body;

  if (!name || percentage === undefined || percentage === null || percentage === '' || !type) {
    return res.error('name, percentage, and type are required', 400);
  }

  const pct = parsePercentage(percentage);
  if (pct === null || pct < 0 || pct > 100) {
    return res.error('percentage must be between 0 and 100', 400);
  }

  const tax = await Tax.create({
    name: String(name).trim(),
    percentage: pct,
    type: String(type).trim(),
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
  });

  return res.success(tax.get({ plain: true }), 'Tax created', 201);
});

const updateTax = asyncHandler(async (req, res) => {
  const tax = await Tax.findByPk(req.params.id);
  if (!tax) {
    return res.error('Tax not found', 404);
  }

  const { name, percentage, type, isActive } = req.body;

  if (name !== undefined) {
    tax.name = String(name).trim();
  }
  if (percentage !== undefined) {
    const pct = parsePercentage(percentage);
    if (pct === null || pct < 0 || pct > 100) {
      return res.error('percentage must be between 0 and 100', 400);
    }
    tax.percentage = pct;
  }
  if (type !== undefined) {
    tax.type = String(type).trim();
  }
  if (isActive !== undefined) {
    tax.isActive = Boolean(isActive);
  }

  await tax.save();
  return res.success(tax.get({ plain: true }), 'Tax updated', 200);
});

const deleteTax = asyncHandler(async (req, res) => {
  const tax = await Tax.findByPk(req.params.id);
  if (!tax) {
    return res.error('Tax not found', 404);
  }

  const inUse = await OrderLine.count({ where: { taxId: tax.id } });
  if (inUse > 0) {
    return res.error('Cannot delete tax that is in use', 400);
  }

  await tax.destroy();
  return res.success(null, 'Tax deleted successfully', 200);
});

module.exports = {
  getAllTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
};
