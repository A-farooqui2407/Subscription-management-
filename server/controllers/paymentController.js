/**
 * Payments — list and detail with invoice context.
 */
const { Op } = require('sequelize');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { PAYMENT_METHODS } = require('../services/invoiceService');
const { parsePagination } = require('../utils/pagination');

const paymentListInclude = [
  {
    model: Invoice,
    as: 'invoice',
    attributes: [
      'id',
      'invoiceNumber',
      'subscriptionId',
      'subtotal',
      'tax',
      'discountAmount',
      'total',
      'status',
      'dueDate',
    ],
    include: [
      {
        model: Subscription,
        as: 'subscription',
        attributes: ['id', 'customerId', 'subscriptionNumber'],
        include: [{ model: Contact, as: 'customer', attributes: ['id', 'name'] }],
      },
    ],
  },
];

const getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  if (req.query.paymentMethod !== undefined && req.query.paymentMethod !== '') {
    if (!PAYMENT_METHODS.includes(req.query.paymentMethod)) {
      return res.error('Invalid paymentMethod filter', 400);
    }
    where.paymentMethod = req.query.paymentMethod;
  }

  if (req.query.invoiceId !== undefined && req.query.invoiceId !== '') {
    where.invoiceId = req.query.invoiceId;
  }

  const { startDate, endDate } = req.query;
  if (startDate && endDate) {
    where.paymentDate = {
      [Op.between]: [String(startDate).slice(0, 10), String(endDate).slice(0, 10)],
    };
  } else if (startDate || endDate) {
    return res.error('Both startDate and endDate are required for date range', 400);
  }

  const count = await Payment.count({ where });
  const rows = await Payment.findAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: paymentListInclude,
  });

  const data = rows.map((r) => r.get({ plain: true }));
  return res.paginated(data, count, page, limit);
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      {
        model: Invoice,
        as: 'invoice',
        include: [
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'customerId', 'subscriptionNumber', 'planId', 'status'],
            include: [{ model: Contact, as: 'customer', attributes: ['id', 'name', 'email'] }],
          },
        ],
      },
    ],
  });

  if (!payment) {
    return res.error('Payment not found', 404);
  }

  return res.success(payment.get({ plain: true }), 'Success', 200);
});

module.exports = {
  getAllPayments,
  getPaymentById,
};
