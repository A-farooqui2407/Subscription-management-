/**
 * Tax CRUD.
 */
const express = require('express');
const taxController = require('../controllers/taxController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.post('/', taxController.createTax);
router.get('/', taxController.listTaxes);
router.get('/:id', taxController.getTaxById);
router.patch('/:id', taxController.updateTax);
router.delete('/:id', taxController.deleteTax);

module.exports = router;
