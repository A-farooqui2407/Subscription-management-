/**
 * Discount CRUD — Admin only.
 */
const express = require('express');
const discountController = require('../controllers/discountController');
// const verifyToken = require('../middleware/verifyToken');
// const checkRole = require('../middleware/checkRole');

const router = express.Router();

// TODO: router.use(verifyToken, checkRole('Admin'));
router.post('/', discountController.createDiscount);
router.get('/', discountController.listDiscounts);
router.get('/:id', discountController.getDiscountById);
router.patch('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
