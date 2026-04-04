/**
 * Dashboard KPIs + filtered reports (Admin / InternalUser for reports).
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), dashboardController.getDashboardKPIs);
router.get(
  '/reports',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser', 'PortalUser'),
  dashboardController.getReports
);

module.exports = router;
