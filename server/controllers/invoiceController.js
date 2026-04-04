/**
 * Invoices — draft → confirmed → paid; cancel, send (email), print (JSON stub).
 */
const { Op } = require('sequelize');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const invoiceService = require('../services/invoiceService');

const LIST_STATUSES = ['draft', 'confirmed', 'paid'];

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

const getAllInvoices = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};
  const andParts = [];

  if (req.query.status !== undefined && req.query.status !== '') {
    if (!LIST_STATUSES.includes(req.query.status)) {
      return res.error('Invalid status filter', 400);
    }
    where.status = req.query.status;
  }

  const { startDate, endDate } = req.query;
  if (startDate && endDate) {
    andParts.push({
      createdAt: {
        [Op.between]: [
          new Date(`${String(startDate).slice(0, 10)}T00:00:00.000Z`),
          new Date(`${String(endDate).slice(0, 10)}T23:59:59.999Z`),
        ],
      },
    });
  } else if (startDate || endDate) {
    return res.error('Both startDate and endDate are required for date range', 400);
  }

  if (req.query.overdue === 'true') {
    andParts.push({ dueDate: { [Op.lt]: invoiceService.todayDateOnly() } });
    andParts.push({ status: { [Op.ne]: 'paid' } });
  }

  if (andParts.length) {
    where[Op.and] = andParts;
  }

  const count = await Invoice.count({ where });
  const rows = await Invoice.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Subscription,
        as: 'subscription',
        attributes: ['id', 'customerId', 'subscriptionNumber', 'status'],
        include: [{ model: Contact, as: 'customer', attributes: ['id', 'name', 'email'] }],
      },
    ],
  });

  const data = rows.map((r) => r.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceWithDetails(req.params.id);
  if (!invoice) {
    return res.error('Invoice not found', 404);
  }
  return res.success(invoice.get({ plain: true }), 'Success', 200);
});

const confirmInvoice = asyncHandler(async (req, res) => {
  const updated = await invoiceService.confirmInvoice(req.params.id);
  return res.success(updated.get({ plain: true }), 'Invoice confirmed', 200);
});

const cancelInvoice = asyncHandler(async (req, res) => {
  await invoiceService.cancelInvoice(req.params.id);
  return res.success(null, 'Invoice cancelled', 200);
});

const sendInvoice = asyncHandler(async (req, res) => {
  const updated = await invoiceService.sendInvoice(req.params.id);
  return res.success(updated.get({ plain: true }), 'Invoice sent', 200);
});

const printInvoice = asyncHandler(async (req, res) => {
  // TODO: Replace with PDF generation in bonus phase
  const invoice = await invoiceService.getInvoiceWithDetails(req.params.id);
  if (!invoice) {
    return res.error('Invoice not found', 404);
  }
  return res.success(invoice.get({ plain: true }), 'Success', 200);
});

const recordPayment = asyncHandler(async (req, res) => {
  const { invoice, payment } = await invoiceService.recordPayment(req.params.id, req.body);
  return res.success(
    {
      invoice: invoice.get({ plain: true }),
      payment: payment.get({ plain: true }),
    },
    'Payment recorded',
    201
  );
});

module.exports = {
  getAllInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  sendInvoice,
  printInvoice,
  recordPayment,
};
