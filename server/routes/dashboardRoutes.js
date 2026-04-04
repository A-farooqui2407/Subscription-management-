/**
 * Dashboard KPIs + filtered reports.
 */
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.get('/', dashboardController.getDashboard);
router.get('/reports', dashboardController.getReports);

module.exports = router;
