/**
 * Quotation template CRUD.
 */
const express = require('express');
const quotationTemplateController = require('../controllers/quotationTemplateController');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// TODO: router.use(verifyToken);
router.post('/', quotationTemplateController.createQuotationTemplate);
router.get('/', quotationTemplateController.listQuotationTemplates);
router.get('/:id', quotationTemplateController.getQuotationTemplateById);
router.patch('/:id', quotationTemplateController.updateQuotationTemplate);
router.delete('/:id', quotationTemplateController.deleteQuotationTemplate);

module.exports = router;
