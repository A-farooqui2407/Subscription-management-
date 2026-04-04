/**
 * Products + nested variants — variant routes registered before /:id.
 */
const express = require('express');
const productController = require('../controllers/productController');
const variantController = require('../controllers/variantController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), productController.getAllProducts);
router.post(
  '/',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  productController.createProduct
);

router.get(
  '/:productId/variants',
  validateUuid('productId'),
  asyncHandler(verifyToken),
  variantController.getVariantsByProduct
);
router.post(
  '/:productId/variants',
  validateUuid('productId'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.createVariant
);
router.put(
  '/:productId/variants/:id',
  validateUuid('productId', 'id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.updateVariant
);
router.delete(
  '/:productId/variants/:id',
  validateUuid('productId', 'id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.deleteVariant
);

router.get('/:id', validateUuid('id'), asyncHandler(verifyToken), productController.getProductById);
router.put(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  productController.updateProduct
);
router.delete(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  productController.deleteProduct
);

module.exports = router;
