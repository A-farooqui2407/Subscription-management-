/**
 * Invoice lifecycle — generate from subscription, confirm, cancel, send, pay, detail load.
 */
const { sequelize } = require('../config/db');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Contact = require('../models/Contact');
const OrderLine = require('../models/OrderLine');
const Product = require('../models/Product');
const Tax = require('../models/Tax');
const Variant = require('../models/Variant');
const emailService = require('./emailService');

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'upi'];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Today as YYYY-MM-DD (local) for DATEONLY comparisons.
 */
function todayDateOnly() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Add calendar days to today → YYYY-MM-DD (local).
 * @param {number} days
 */
function addDaysFromTodayDateOnly(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Due offset from subscription payment terms (explicit Net 30 / Net 15, else 30).
 * @param {string|null|undefined} paymentTerms
 */
function dueDaysFromPaymentTerms(paymentTerms) {
  const s = paymentTerms != null ? String(paymentTerms).trim() : '';
  if (s === 'Net 30') {
    return 30;
  }
  if (s === 'Net 15') {
    return 15;
  }
  return 30;
}

function subscriptionDetailInclude() {
  return {
    model: Subscription,
    as: 'subscription',
    include: [
      {
        model: Contact,
        as: 'customer',
        attributes: ['id', 'name', 'email', 'phone', 'type'],
      },
      {
        model: OrderLine,
        as: 'orderLines',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'productType', 'salesPrice'],
          },
          {
            model: Tax,
            as: 'tax',
            required: false,
            attributes: ['id', 'name', 'percentage', 'type'],
          },
          { model: Variant, as: 'variant', required: false },
        ],
      },
    ],
  };
}

/**
 * @param {import('sequelize').Model} subscription — must include orderLines (array)
 */
async function generateInvoice(subscription) {
  if (!subscription || !Array.isArray(subscription.orderLines)) {
    throw httpError(400, 'Subscription must be loaded with orderLines');
  }

  const days = dueDaysFromPaymentTerms(subscription.paymentTerms);
  const dueDate = addDaysFromTodayDateOnly(days);

  const inv = await Invoice.create({
    subscriptionId: subscription.id,
    subtotal: subscription.subtotal,
    tax: subscription.taxAmount,
    discountAmount: subscription.discountAmount ?? 0,
    total: subscription.total,
    status: 'draft',
    dueDate,
  });

  return inv;
}

async function generateInvoiceForSubscription(subscription) {
  return generateInvoice(subscription);
}

/**
 * @param {string} invoiceId
 */
async function confirmInvoice(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw httpError(404, 'Invoice not found');
  }
  if (invoice.status !== 'draft') {
    throw httpError(400, 'Only draft invoices can be confirmed');
  }
  invoice.status = 'confirmed';
  await invoice.save();
  return invoice;
}

/**
 * @param {string} invoiceId
 */
async function cancelInvoice(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw httpError(404, 'Invoice not found');
  }
  if (invoice.status === 'paid') {
    throw httpError(400, 'Cannot cancel a paid invoice');
  }
  if (!['draft', 'confirmed'].includes(invoice.status)) {
    throw httpError(400, 'Invoice cannot be cancelled');
  }
  invoice.status = 'cancelled';
  invoice.cancelledAt = new Date();
  await invoice.save();
  await invoice.destroy();
}

/**
 * @param {string} invoiceId
 */
async function sendInvoice(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      {
        model: Subscription,
        as: 'subscription',
        include: [{ model: Contact, as: 'customer', attributes: ['id', 'name', 'email'] }],
      },
    ],
  });

  if (!invoice) {
    throw httpError(404, 'Invoice not found');
  }

  if (invoice.status !== 'confirmed') {
    throw httpError(400, 'Invoice must be confirmed before it can be sent');
  }

  const sub = invoice.subscription;
  const customer = sub && sub.customer;
  const to = customer && customer.email;
  if (!to) {
    throw httpError(400, 'Customer email is missing');
  }

  await emailService.sendInvoiceEmail(to, invoice);

  invoice.sentAt = new Date();
  await invoice.save();
  return invoice;
}

/**
 * @param {string} invoiceId
 * @param {{ paymentMethod: string, amount: unknown, paymentDate: unknown, notes?: string }} paymentData
 */
async function recordPayment(invoiceId, paymentData) {
  const { paymentMethod, amount, paymentDate, notes } = paymentData || {};

  if (!paymentMethod || amount === undefined || amount === null || !paymentDate) {
    throw httpError(400, 'paymentMethod, amount, and paymentDate are required');
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw httpError(400, 'Invalid paymentMethod');
  }

  const amt = Number(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    throw httpError(400, 'amount must be greater than 0');
  }

  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw httpError(404, 'Invoice not found');
  }

  if (invoice.status !== 'confirmed') {
    throw httpError(400, 'Payment can only be recorded for a confirmed invoice');
  }

  const t = await sequelize.transaction();
  try {
    const payment = await Payment.create(
      {
        invoiceId: invoice.id,
        paymentMethod,
        amount: amt,
        paymentDate: String(paymentDate).slice(0, 10),
        notes: notes != null && notes !== '' ? String(notes) : null,
      },
      { transaction: t }
    );

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save({ transaction: t });

    await t.commit();

    await payment.reload({ include: [{ model: Invoice, as: 'invoice' }] });
    await invoice.reload();

    return { invoice, payment };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * @param {string} invoiceId
 */
async function getInvoiceWithDetails(invoiceId) {
  return Invoice.findByPk(invoiceId, {
    include: [subscriptionDetailInclude(), { model: Payment, as: 'payments' }],
  });
}

async function recalculateInvoiceTotals(_invoice) {
  // Line-level invoice totals reserved for future phases.
}

async function syncInvoicePaidStatus(_invoice) {
  // Multi-payment reconciliation reserved for future phases.
}

module.exports = {
  generateInvoice,
  generateInvoiceForSubscription,
  confirmInvoice,
  cancelInvoice,
  sendInvoice,
  recordPayment,
  getInvoiceWithDetails,
  recalculateInvoiceTotals,
  syncInvoicePaidStatus,
  dueDaysFromPaymentTerms,
  todayDateOnly,
  PAYMENT_METHODS,
};
