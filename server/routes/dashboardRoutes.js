/**
 * Dashboard KPIs + filtered reports (Admin / InternalUser for reports).
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', verifyToken, dashboardController.getDashboardKPIs);
router.get(
  '/reports',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  dashboardController.getReports
);

module.exports = router;
