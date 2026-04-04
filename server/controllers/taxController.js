/**
 * Tax CRUD — name, percentage, type.
 */

async function createTax(req, res, next) {
  // TODO: validate tax fields
  res.status(501).json({ message: 'Not implemented' });
}

async function listTaxes(req, res, next) {
  // TODO: return all taxes
  res.status(501).json({ message: 'Not implemented' });
}

async function getTaxById(req, res, next) {
  // TODO: single tax
  res.status(501).json({ message: 'Not implemented' });
}

async function updateTax(req, res, next) {
  // TODO: update tax
  res.status(501).json({ message: 'Not implemented' });
}

async function deleteTax(req, res, next) {
  // TODO: check references on order lines
  res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  createTax,
  listTaxes,
  getTaxById,
  updateTax,
  deleteTax,
};
