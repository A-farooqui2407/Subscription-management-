/**
 * Plans — read for authenticated users; writes Admin-only.
 */
const express = require('express');
const planController = require('../controllers/planController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), planController.getAllPlans);
router.get('/:id', asyncHandler(verifyToken), planController.getPlanById);
router.post(
  '/',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  planController.createPlan
);
router.put(
  '/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  planController.updatePlan
);
router.delete(
  '/:id',
  asyncHandler(verifyToken),
  checkRole('Admin'),
  planController.deletePlan
);

module.exports = router;
