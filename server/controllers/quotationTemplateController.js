/**
 * Quotation template CRUD — name, validityDays, planId, productLines (JSON).
 */

async function createQuotationTemplate(req, res, next) {
  // TODO: validate planId exists; store productLines JSON
  res.status(501).json({ message: 'Not implemented' });
}

async function listQuotationTemplates(req, res, next) {
  // TODO: list templates
  res.status(501).json({ message: 'Not implemented' });
}

async function getQuotationTemplateById(req, res, next) {
  // TODO: single template
  res.status(501).json({ message: 'Not implemented' });
}

async function updateQuotationTemplate(req, res, next) {
  // TODO: update template
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteQuotationTemplate(req, res, next) {
  // TODO: delete template
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createQuotationTemplate,
  listQuotationTemplates,
  getQuotationTemplateById,
  updateQuotationTemplate,
  deleteQuotationTemplate,
};
