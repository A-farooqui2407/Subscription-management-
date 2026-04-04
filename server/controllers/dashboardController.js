/**
 * Dashboard KPIs + filtered invoice reports.
 */
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Subscription,
  Payment,
  Invoice,
  Contact,
  Plan,
} = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const { todayDateOnly } = require('../services/invoiceService');
const { parsePagination } = require('../utils/pagination');

const REPORT_STATUSES = ['draft', 'confirmed', 'paid'];

function buildSubscriptionIncludeForReports(customerId) {
  const customerNested = {
    model: Contact,
    as: 'customer',
    attributes: ['name', 'email'],
  };
  if (customerId) {
    return {
      model: Subscription,
      as: 'subscription',
      required: true,
      where: { customerId },
      include: [customerNested],
    };
  }
  return {
    model: Subscription,
    as: 'subscription',
    required: false,
    include: [customerNested],
  };
}

function buildInvoiceWhereForReports(query) {
  const where = {};
  const { startDate, endDate, status } = query;

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [
        new Date(`${String(startDate).slice(0, 10)}T00:00:00.000Z`),
        new Date(`${String(endDate).slice(0, 10)}T23:59:59.999Z`),
      ],
    };
  }

  if (status !== undefined && status !== '') {
    where.status = status;
  }

  return where;
}

const getDashboardKPIs = asyncHandler(async (req, res) => {
  const today = todayDateOnly();

  const overdueInvoiceWhere = {
    status: { [Op.ne]: 'paid' },
    dueDate: { [Op.lt]: today },
  };

  const [
    activeSubscriptions,
    totalRevenueRow,
    pendingPayments,
    overdueInvoices,
    recentSubscriptions,
    recentPayments,
    overdueInvoicesList,
  ] = await Promise.all([
    Subscription.count({ where: { status: 'active' } }),
    Payment.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      raw: true,
    }),
    Invoice.count({ where: { status: 'confirmed' } }),
    Invoice.count({ where: overdueInvoiceWhere }),
    Subscription.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'subscriptionNumber', 'status', 'createdAt'],
      include: [
        { model: Contact, as: 'customer', attributes: ['id', 'name'] },
        { model: Plan, as: 'plan', attributes: ['id', 'name'] },
      ],
    }),
    Payment.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'amount', 'paymentMethod', 'paymentDate', 'createdAt'],
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'invoiceNumber'],
          include: [
            {
              model: Subscription,
              as: 'subscription',
              attributes: ['id'],
              include: [{ model: Contact, as: 'customer', attributes: ['id', 'name'] }],
            },
          ],
        },
      ],
    }),
    Invoice.findAll({
      where: overdueInvoiceWhere,
      limit: 10,
      order: [['dueDate', 'ASC']],
      attributes: [
        'id',
        'invoiceNumber',
        'subscriptionId',
        'total',
        'status',
        'dueDate',
        'createdAt',
      ],
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'subscriptionNumber'],
          include: [{ model: Contact, as: 'customer', attributes: ['id', 'name'] }],
        },
      ],
    }),
  ]);

  const totalRevenue =
    totalRevenueRow && totalRevenueRow.total != null ? Number(totalRevenueRow.total) : 0;

  return res.success(
    {
      kpis: {
        activeSubscriptions,
        totalRevenue,
        pendingPayments,
        overdueInvoices,
      },
      recentSubscriptions: recentSubscriptions.map((r) => r.get({ plain: true })),
      recentPayments: recentPayments.map((r) => r.get({ plain: true })),
      overdueInvoicesList: overdueInvoicesList.map((r) => r.get({ plain: true })),
    },
    'Success',
    200
  );
});

const getReports = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, customerId } = req.query;

  if ((startDate && !endDate) || (!startDate && endDate)) {
    return res.error('Both startDate and endDate are required when filtering by date', 400);
  }

  if (status !== undefined && status !== '' && !REPORT_STATUSES.includes(status)) {
    return res.error('Invalid status filter', 400);
  }

  const invoiceWhere = buildInvoiceWhereForReports(req.query);
  const subscriptionInclude = buildSubscriptionIncludeForReports(
    customerId !== undefined && customerId !== '' ? customerId : null
  );

  const paymentsInclude = {
    model: Payment,
    as: 'payments',
    required: false,
  };

  const reportIncludes = [subscriptionInclude, paymentsInclude];

  const { page, limit, offset } = parsePagination(req.query);
  const today = todayDateOnly();

  const paidWhere = { [Op.and]: [invoiceWhere, { status: 'paid' }] };
  const pendingWhere = { [Op.and]: [invoiceWhere, { status: 'confirmed' }] };
  const overdueWhere = {
    [Op.and]: [
      invoiceWhere,
      { status: { [Op.ne]: 'paid' } },
      { dueDate: { [Op.lt]: today } },
    ],
  };

  const [
    filteredRows,
    total,
    totalAmountRaw,
    paidAmountRaw,
    pendingAmountRaw,
    overdueCount,
  ] = await Promise.all([
    Invoice.findAll({
      where: invoiceWhere,
      include: reportIncludes,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    }),
    Invoice.count({
      where: invoiceWhere,
      include: [subscriptionInclude],
      distinct: true,
      col: 'Invoice.id',
    }),
    Invoice.sum('total', {
      where: invoiceWhere,
      include: [subscriptionInclude],
    }),
    Invoice.sum('total', {
      where: paidWhere,
      include: [subscriptionInclude],
    }),
    Invoice.sum('total', {
      where: pendingWhere,
      include: [subscriptionInclude],
    }),
    Invoice.count({
      where: overdueWhere,
      include: [subscriptionInclude],
      distinct: true,
      col: 'Invoice.id',
    }),
  ]);

  const totalAmount = totalAmountRaw != null ? Number(totalAmountRaw) : 0;
  const paidAmount = paidAmountRaw != null ? Number(paidAmountRaw) : 0;
  const pendingAmount = pendingAmountRaw != null ? Number(pendingAmountRaw) : 0;

  return res.success(
    {
      summary: {
        totalInvoices: total,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueCount,
      },
      invoices: filteredRows.map((r) => r.get({ plain: true })),
      pagination: {
        page,
        limit,
        total,
      },
    },
    'Success',
    200
  );
});

module.exports = {
  getDashboardKPIs,
  getReports,
};
