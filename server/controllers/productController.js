/**
 * Products + variants — Admin-only product CRUD; variants linked to product.
 */

async function createProduct(req, res, next) {
  // TODO: name, productType, salesPrice, costPrice
  res.status(501).json({ message: 'Not implemented' });
}

async function listProducts(req, res, next) {
  // TODO: list all products (optional pagination)
  res.status(501).json({ message: 'Not implemented' });
}

async function getProductById(req, res, next) {
  // TODO: include variants optionally
  res.status(501).json({ message: 'Not implemented' });
}

async function updateProduct(req, res, next) {
  // TODO: update product fields
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteProduct(req, res, next) {
  // TODO: handle variants / order line references
  res.status(501).json({ message: 'Not implemented' });
}

async function createVariant(req, res, next) {
  // TODO: productId from route/body; attribute, value, extraPrice
  res.status(501).json({ message: 'Not implemented' });
}

async function updateVariant(req, res, next) {
  // TODO: update variant by id; ensure belongs to product
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteVariant(req, res, next) {
  // TODO: delete variant
  res.status(501).json({ message: 'Not implemented' });
}

async function listVariantsByProductId(req, res, next) {
  // TODO: GET /products/:productId/variants — all variants for product
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  listVariantsByProductId,
};
