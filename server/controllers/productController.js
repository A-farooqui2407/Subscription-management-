/**
 * Products — reads for authenticated users; writes Admin-only (routes).
 */
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const OrderLine = require('../models/OrderLine');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const PRODUCT_TYPES = ['Service', 'Physical', 'Digital'];

function parseDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
}

const getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  const { productType, search } = req.query;
  if (productType !== undefined && productType !== '') {
    if (!PRODUCT_TYPES.includes(productType)) {
      return res.error('Invalid productType filter', 400);
    }
    where.productType = productType;
  }
  if (search !== undefined && search !== '') {
    where.name = { [Op.iLike]: `%${String(search).trim()}%` };
  }

  const count = await Product.count({ where });
  const rows = await Product.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{ model: Variant, as: 'variants', required: false }],
  });

  const data = rows.map((p) => p.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Variant, as: 'variants', required: false }],
  });
  if (!product) {
    return res.error('Product not found', 404);
  }
  return res.success(product.get({ plain: true }), 'Success', 200);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, productType, salesPrice, costPrice } = req.body;

  if (!name || !productType || salesPrice === undefined || salesPrice === null || salesPrice === '') {
    return res.error('Name, productType, and salesPrice are required', 400);
  }

  if (!PRODUCT_TYPES.includes(productType)) {
    return res.error('productType must be Service, Physical, or Digital', 400);
  }

  const sp = parseDecimal(salesPrice);
  if (sp === null || sp < 0) {
    return res.error('Invalid salesPrice', 400);
  }
  const cp = parseDecimal(costPrice, 0);
  if (cp === null || cp < 0) {
    return res.error('Invalid costPrice', 400);
  }

  const product = await Product.create({
    name: String(name).trim(),
    productType,
    salesPrice: sp,
    costPrice: cp,
    createdBy: req.user.id,
  });

  const created = await Product.findByPk(product.id, {
    include: [{ model: Variant, as: 'variants', required: false }],
  });

  return res.success(created.get({ plain: true }), 'Product created', 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.error('Product not found', 404);
  }

  const { name, productType, salesPrice, costPrice } = req.body;

  if (name !== undefined) {
    product.name = String(name).trim();
  }
  if (productType !== undefined) {
    if (!PRODUCT_TYPES.includes(productType)) {
      return res.error('productType must be Service, Physical, or Digital', 400);
    }
    product.productType = productType;
  }
  if (salesPrice !== undefined) {
    const sp = parseDecimal(salesPrice);
    if (sp === null || sp < 0) {
      return res.error('Invalid salesPrice', 400);
    }
    product.salesPrice = sp;
  }
  if (costPrice !== undefined) {
    const cp = parseDecimal(costPrice, 0);
    if (cp === null || cp < 0) {
      return res.error('Invalid costPrice', 400);
    }
    product.costPrice = cp;
  }

  await product.save();

  const updated = await Product.findByPk(product.id, {
    include: [{ model: Variant, as: 'variants', required: false }],
  });

  return res.success(updated.get({ plain: true }), 'Product updated', 200);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.error('Product not found', 404);
  }

  const lines = await OrderLine.findAll({
    where: { productId: product.id },
    attributes: ['subscriptionId'],
  });
  const subscriptionIds = [...new Set(lines.map((l) => l.subscriptionId))];

  if (subscriptionIds.length > 0) {
    const activeCount = await Subscription.count({
      where: {
        id: { [Op.in]: subscriptionIds },
        status: { [Op.in]: ['active', 'confirmed'] },
      },
    });
    if (activeCount > 0) {
      return res.error('Cannot delete product used on active or confirmed subscriptions', 400);
    }
  }

  await product.destroy();
  return res.success(null, 'Product deleted successfully', 200);
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
