/**
 * Taxes — read for authenticated users; writes Admin-only.
 */
const express = require('express');
const taxController = require('../controllers/taxController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), taxController.getAllTaxes);
router.get('/:id', validateUuid('id'), asyncHandler(verifyToken), taxController.getTaxById);
router.post(
  '/',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  taxController.createTax
);
router.put(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  taxController.updateTax
);
router.delete(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  taxController.deleteTax
);

module.exports = router;
