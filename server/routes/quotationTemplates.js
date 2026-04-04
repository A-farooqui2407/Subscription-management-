/**
 * Quotation template CRUD — authenticated reads; Admin / InternalUser writes; Admin-only delete.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const quotationTemplateController = require('../controllers/quotationTemplateController');

const router = express.Router();

router.get('/', verifyToken, quotationTemplateController.getAllTemplates);
router.get('/:id', verifyToken, quotationTemplateController.getTemplateById);
router.post(
  '/',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  quotationTemplateController.createTemplate
);
router.put(
  '/:id',
  verifyToken,
  checkRole('Admin', 'InternalUser'),
  quotationTemplateController.updateTemplate
);
router.delete(
  '/:id',
  verifyToken,
  checkRole('Admin'),
  quotationTemplateController.deleteTemplate
);

module.exports = router;
