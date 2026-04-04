/**
 * Plan CRUD.
 */
const express = require('express');
const planController = require('../controllers/planController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.post('/', planController.createPlan);
router.get('/', planController.listPlans);
router.get('/:id', planController.getPlanById);
router.patch('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
