/**
 * Quotation template CRUD — authenticated reads; Admin / InternalUser writes; Admin-only delete.
 */
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const quotationTemplateController = require('../controllers/quotationTemplateController');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.get('/', asyncHandler(verifyToken), quotationTemplateController.getAllTemplates);
router.get(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  quotationTemplateController.getTemplateById
);
router.post(
  '/',
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  quotationTemplateController.createTemplate
);
router.put(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin', 'InternalUser'),
  quotationTemplateController.updateTemplate
);
router.delete(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  quotationTemplateController.deleteTemplate
);

module.exports = router;
