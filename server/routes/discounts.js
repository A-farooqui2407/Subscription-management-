/**
 * Discounts — Admin only.
 */
const express = require('express');
const discountController = require('../controllers/discountController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(asyncHandler(verifyToken));
router.use(checkRole('Admin'));

router.get('/', discountController.getAllDiscounts);
router.get('/:id', discountController.getDiscountById);
router.post('/', discountController.createDiscount);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
