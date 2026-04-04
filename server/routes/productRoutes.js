/**
 * Products + variants — Admin-only for mutations; GET may be authenticated staff.
 */
const express = require('express');
const productController = require('../controllers/productController');
// const verifyToken = require('../middleware/verifyToken');
// const checkRole = require('../middleware/checkRole');

const router = express.Router();

// TODO: router.use(verifyToken);
// TODO: mutate routes: checkRole('Admin')
router.post('/', productController.createProduct);
router.get('/', productController.listProducts);
// Register variant sub-routes before `/:id` so paths like `/123/variants` are not captured as id.
router.get('/:productId/variants', productController.listVariantsByProductId);
router.post('/:productId/variants', productController.createVariant);
router.patch('/variants/:variantId', productController.updateVariant);
router.delete('/variants/:variantId', productController.deleteVariant);
router.get('/:id', productController.getProductById);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
