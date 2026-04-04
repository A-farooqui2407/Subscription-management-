/**
 * Variants — Admin-only mutations (routes); reads authenticated.
 */
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const asyncHandler = require('../utils/asyncHandler');

function parseExtraPrice(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const n = Number(value);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
}

const getVariantsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByPk(productId);
  if (!product) {
    return res.error('Product not found', 404);
  }

  const variants = await Variant.findAll({
    where: { productId: product.id },
    order: [['createdAt', 'ASC']],
  });

  return res.success(
    variants.map((v) => v.get({ plain: true })),
    'Success',
    200
  );
});

const createVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { attribute, value, extraPrice } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) {
    return res.error('Product not found', 404);
  }

  if (!attribute || !value) {
    return res.error('attribute and value are required', 400);
  }

  const ep = parseExtraPrice(extraPrice);
  if (ep === null || ep < 0) {
    return res.error('Invalid extraPrice', 400);
  }

  const variant = await Variant.create({
    productId: product.id,
    attribute: String(attribute).trim(),
    value: String(value).trim(),
    extraPrice: ep,
  });

  return res.success(variant.get({ plain: true }), 'Variant created', 201);
});

const updateVariant = asyncHandler(async (req, res) => {
  const { productId, id } = req.params;

  const variant = await Variant.findByPk(id);
  if (!variant) {
    return res.error('Variant not found', 404);
  }

  if (String(variant.productId) !== String(productId)) {
    return res.error('Variant does not belong to this product', 403);
  }

  const { attribute, value, extraPrice } = req.body;

  if (attribute !== undefined) {
    variant.attribute = String(attribute).trim();
  }
  if (value !== undefined) {
    variant.value = String(value).trim();
  }
  if (extraPrice !== undefined) {
    const ep = parseExtraPrice(extraPrice);
    if (ep === null || ep < 0) {
      return res.error('Invalid extraPrice', 400);
    }
    variant.extraPrice = ep;
  }

  await variant.save();
  return res.success(variant.get({ plain: true }), 'Variant updated', 200);
});

const deleteVariant = asyncHandler(async (req, res) => {
  const { productId, id } = req.params;

  const variant = await Variant.findByPk(id);
  if (!variant) {
    return res.error('Variant not found', 404);
  }

  if (String(variant.productId) !== String(productId)) {
    return res.error('Variant does not belong to this product', 403);
  }

  await variant.destroy();
  return res.success(null, 'Variant deleted successfully', 200);
});

module.exports = {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
};
