/**
 * Subscription — fields: id, subscriptionNumber (auto-gen), customerId, planId, discountId,
 * startDate, expirationDate, paymentTerms, status
 * Status flow: Draft → Quotation → Confirmed → Active → Closed
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subscription = sequelize.define(
  'Subscription',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: subscriptionNumber unique auto-generated
    // TODO: customerId, planId, discountId (nullable FKs)
    // TODO: startDate, expirationDate, paymentTerms, status
  },
  {
    tableName: 'subscriptions',
  }
);

// TODO: belongsTo Contact (customer), Plan, Discount; hasMany OrderLine, Invoice

module.exports = Subscription;
