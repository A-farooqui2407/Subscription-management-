/**
 * Discounts — read for all authenticated roles; writes Admin only.
 */
const express = require('express');
const discountController = require('../controllers/discountController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

const staffAndPortal = ['Admin', 'InternalUser', 'PortalUser'];

router.get(
  '/',
  asyncHandler(verifyToken),
  checkRole(...staffAndPortal),
  discountController.getAllDiscounts
);
router.get(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole(...staffAndPortal),
  discountController.getDiscountById
);
router.post('/', asyncHandler(verifyToken), checkRole('Admin'), discountController.createDiscount);
router.put(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  discountController.updateDiscount
);
router.delete(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  discountController.deleteDiscount
);

module.exports = router;
