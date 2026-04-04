/**
 * Loads all Sequelize models and registers associations in one place.
 */
const { sequelize } = require('../config/db');

const User = require('./User');
const Contact = require('./Contact');
const Product = require('./Product');
const Variant = require('./Variant');
const Tax = require('./Tax');
const Discount = require('./Discount');
const Plan = require('./Plan');
const QuotationTemplate = require('./QuotationTemplate');
const Subscription = require('./Subscription');
const OrderLine = require('./OrderLine');
const Invoice = require('./Invoice');
const Payment = require('./Payment');

User.hasMany(Contact, { foreignKey: 'createdBy', as: 'contacts' });
Contact.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Product.hasMany(Variant, { foreignKey: 'productId', as: 'variants' });
Variant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Plan, { foreignKey: 'createdBy', as: 'plans' });
Plan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Plan.hasMany(QuotationTemplate, { foreignKey: 'planId', as: 'templates' });
QuotationTemplate.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
User.hasMany(QuotationTemplate, { foreignKey: 'createdBy', as: 'quotationTemplates' });
QuotationTemplate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Plan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

Subscription.belongsTo(Contact, { foreignKey: 'customerId', as: 'customer' });
User.hasMany(Subscription, { foreignKey: 'createdBy', as: 'createdSubscriptions' });
Subscription.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Discount, { foreignKey: 'createdBy', as: 'discounts' });
Discount.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Discount.hasMany(Subscription, { foreignKey: 'discountId', as: 'subscriptions' });
Subscription.belongsTo(Discount, { foreignKey: 'discountId', as: 'discount' });

Subscription.hasMany(OrderLine, { foreignKey: 'subscriptionId', as: 'orderLines' });
OrderLine.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

OrderLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
OrderLine.belongsTo(Tax, { foreignKey: 'taxId', as: 'tax' });
OrderLine.belongsTo(Variant, { foreignKey: 'variantId', as: 'variant' });

Subscription.hasMany(Invoice, { foreignKey: 'subscriptionId', as: 'invoices' });
Invoice.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

module.exports = {
  sequelize,
  User,
  Contact,
  Product,
  Variant,
  Tax,
  Discount,
  Plan,
  QuotationTemplate,
  Subscription,
  OrderLine,
  Invoice,
  Payment,
};
