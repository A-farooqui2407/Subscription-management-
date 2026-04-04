/**
 * Demo database seed: admin user, contacts, catalog, plans, subscriptions (draft + active),
 * auto-generated invoice, confirmed + paid payment for dashboard KPIs.
 *
 * Usage: npm run seed
 * Re-seed: SEED_FORCE=1 npm run seed  (removes prior demo subscriptions chain only)
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { validateEnv, hasDatabaseConfig } = require('../config/validateEnv');

require('../models/index');

const User = require('../models/User');
const Contact = require('../models/Contact');
const Tax = require('../models/Tax');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const OrderLine = require('../models/OrderLine');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const planService = require('../services/planService');
const { generateInvoice, confirmInvoice, recordPayment } = require('../services/invoiceService');

validateEnv({ requireSmtp: false });

const DEMO_SUB_DRAFT = 'SUB-DEMO-DRAFT';
const DEMO_SUB_ACTIVE = 'SUB-DEMO-ACTIVE';

const ADMIN_EMAIL = 'admin@demo.subscription';
const ADMIN_PASSWORD = 'Demo123!Secure';

async function recalcSubscriptionTotals(subscriptionId, transaction) {
  const lines = await OrderLine.findAll({ where: { subscriptionId }, transaction });
  let subtotal = 0;
  let taxSum = 0;
  for (const line of lines) {
    subtotal += Number(line.qty) * Number(line.unitPrice);
    taxSum += Number(line.taxAmount || 0);
  }
  const sub = await Subscription.findByPk(subscriptionId, { transaction });
  const disc = Number(sub.discountAmount || 0);
  sub.subtotal = subtotal;
  sub.taxAmount = taxSum;
  sub.total = Math.max(0, subtotal + taxSum - disc);
  await sub.save({ transaction });
  return sub;
}

async function cleanupDemoSubscriptions() {
  const subs = await Subscription.findAll({
    where: { subscriptionNumber: { [Op.in]: [DEMO_SUB_DRAFT, DEMO_SUB_ACTIVE] } },
    paranoid: false,
  });
  const subIds = subs.map((s) => s.id);
  if (subIds.length === 0) return;

  const invoices = await Invoice.findAll({
    where: { subscriptionId: { [Op.in]: subIds } },
    paranoid: false,
  });
  const invIds = invoices.map((i) => i.id);

  if (invIds.length) {
    await Payment.destroy({ where: { invoiceId: { [Op.in]: invIds } }, force: true });
  }
  for (const inv of invoices) {
    await inv.destroy({ force: true });
  }

  await OrderLine.destroy({ where: { subscriptionId: { [Op.in]: subIds } }, force: true });
  for (const s of subs) {
    await s.destroy({ force: true });
  }
  // eslint-disable-next-line no-console
  console.log('Removed previous demo subscriptions / invoices / payments.');
}

async function run() {
  if (!hasDatabaseConfig()) {
    // eslint-disable-next-line no-console
    console.error('Database not configured. Set DATABASE_URL or DB_* in .env');
    process.exit(1);
  }

  await sequelize.authenticate();
  // eslint-disable-next-line no-console
  console.log('Database OK');

  if (process.env.SEED_FORCE === '1' || process.env.SEED_FORCE === 'true') {
    await cleanupDemoSubscriptions();
  } else {
    const existing = await Subscription.findOne({ where: { subscriptionNumber: DEMO_SUB_ACTIVE } });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(
        'Demo data already present (subscription SUB-DEMO-ACTIVE). Use SEED_FORCE=1 npm run seed to reset demo subs chain.'
      );
      process.exit(0);
    }
  }

  const t = await sequelize.transaction();
  try {
    let admin = await User.unscoped().findOne({
      where: { email: ADMIN_EMAIL },
      transaction: t,
    });
    if (!admin) {
      admin = await User.create(
        {
          name: 'Demo Admin',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'Admin',
        },
        { transaction: t }
      );
      // eslint-disable-next-line no-console
      console.log('Created demo admin:', ADMIN_EMAIL);
    } else {
      // eslint-disable-next-line no-console
      console.log('Using existing admin:', ADMIN_EMAIL);
    }

    const [tax] = await Tax.findOrCreate({
      where: { name: 'Demo GST 10%' },
      defaults: {
        percentage: 10,
        type: 'percentage',
        isActive: true,
      },
      transaction: t,
    });

    const contacts = [];
    for (const c of [
      { name: 'Acme Corp', email: 'billing@acme.demo.subscription', type: 'customer' },
      { name: 'Globex LLC', email: 'hello@globex.demo.subscription', type: 'customer' },
      { name: 'Demo Subscriber', email: 'subscriber@demo.subscription', type: 'subscriber' },
    ]) {
      const [row] = await Contact.findOrCreate({
        where: { email: c.email },
        defaults: { ...c, createdBy: admin.id },
        transaction: t,
      });
      contacts.push(row);
    }

    const [productA] = await Product.findOrCreate({
      where: { name: '[DEMO] SaaS Seat' },
      defaults: {
        productType: 'Service',
        salesPrice: 99.0,
        costPrice: 20.0,
        createdBy: admin.id,
      },
      transaction: t,
    });

    const [productB] = await Product.findOrCreate({
      where: { name: '[DEMO] Add-on Module' },
      defaults: {
        productType: 'Digital',
        salesPrice: 49.0,
        costPrice: 5.0,
        createdBy: admin.id,
      },
      transaction: t,
    });

    const start = new Date().toISOString().slice(0, 10);

    const [planMonthly] = await Plan.findOrCreate({
      where: { name: '[DEMO] Monthly Pro' },
      defaults: {
        price: 99.0,
        billingPeriod: 'monthly',
        minQty: 1,
        isActive: true,
        createdBy: admin.id,
      },
      transaction: t,
    });

    const [planYearly] = await Plan.findOrCreate({
      where: { name: '[DEMO] Yearly Business' },
      defaults: {
        price: 999.0,
        billingPeriod: 'yearly',
        minQty: 1,
        isActive: true,
        createdBy: admin.id,
      },
      transaction: t,
    });

    const expMonthly = planService.calculateNextBillingDate(start, planMonthly.billingPeriod);

    const subDraft = await Subscription.create(
      {
        subscriptionNumber: DEMO_SUB_DRAFT,
        customerId: contacts[0].id,
        planId: planMonthly.id,
        startDate: start,
        expirationDate: expMonthly,
        paymentTerms: 'Net 30',
        status: 'draft',
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        createdBy: admin.id,
      },
      { transaction: t }
    );

    const qty = 2;
    const unitPrice = Number(productA.salesPrice);
    const lineSub = qty * unitPrice;
    const taxPct = Number(tax.percentage);
    const taxAmount = (lineSub * taxPct) / 100;
    await OrderLine.create(
      {
        subscriptionId: subDraft.id,
        productId: productA.id,
        taxId: tax.id,
        qty,
        unitPrice,
        taxPercent: taxPct,
        taxAmount,
        amount: lineSub + taxAmount,
      },
      { transaction: t }
    );
    await recalcSubscriptionTotals(subDraft.id, t);

    const subActive = await Subscription.create(
      {
        subscriptionNumber: DEMO_SUB_ACTIVE,
        customerId: contacts[1].id,
        planId: planYearly.id,
        startDate: start,
        expirationDate: planService.calculateNextBillingDate(start, planYearly.billingPeriod),
        paymentTerms: 'Net 30',
        status: 'active',
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        createdBy: admin.id,
      },
      { transaction: t }
    );

    const upB = Number(productB.salesPrice);
    const lineSubB = 1 * upB;
    const taxAmountB = (lineSubB * taxPct) / 100;
    await OrderLine.create(
      {
        subscriptionId: subActive.id,
        productId: productB.id,
        taxId: tax.id,
        qty: 1,
        unitPrice: upB,
        taxPercent: taxPct,
        taxAmount: taxAmountB,
        amount: lineSubB + taxAmountB,
      },
      { transaction: t }
    );
    await recalcSubscriptionTotals(subActive.id, t);

    await t.commit();
  } catch (e) {
    await t.rollback();
    throw e;
  }

  const subActiveReloaded = await Subscription.findOne({
    where: { subscriptionNumber: DEMO_SUB_ACTIVE },
    include: [{ model: OrderLine, as: 'orderLines' }],
  });

  if (!subActiveReloaded) {
    throw new Error('Active demo subscription missing after seed transaction');
  }

  await generateInvoice(subActiveReloaded);
  const inv = await Invoice.findOne({
    where: { subscriptionId: subActiveReloaded.id },
    order: [['createdAt', 'DESC']],
  });

  if (!inv) {
    throw new Error('Expected invoice after generateInvoice');
  }

  await confirmInvoice(inv.id);
  const invPaid = await Invoice.findByPk(inv.id);
  const paid = await recordPayment(invPaid.id, {
    paymentMethod: 'card',
    amount: Number(invPaid.total),
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: 'Demo seed payment',
  });

  // eslint-disable-next-line no-console
  console.log('--- Demo seed complete ---');
  // eslint-disable-next-line no-console
  console.log('Login:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  // eslint-disable-next-line no-console
  console.log('Active subscription:', DEMO_SUB_ACTIVE, '→ invoice', invPaid.invoiceNumber, '→ paid', paid.payment.id);
  // eslint-disable-next-line no-console
  console.log('Draft subscription:', DEMO_SUB_DRAFT, '(no invoice)');
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
