/**
 * Products + nested variants — variant routes registered before /:id.
 */
const express = require('express');
const productController = require('../controllers/productController');
const variantController = require('../controllers/variantController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');

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
  asyncHandler(verifyToken),
  variantController.getVariantsByProduct
);
router.post(
  '/:productId/variants',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.createVariant
);
router.put(
  '/:productId/variants/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.updateVariant
);
router.delete(
  '/:productId/variants/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  variantController.deleteVariant
);

router.get('/:id', asyncHandler(verifyToken), productController.getProductById);
router.put(
  '/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  productController.updateProduct
);
router.delete(
  '/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  productController.deleteProduct
);

module.exports = router;
