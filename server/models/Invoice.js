/**
 * Invoice — fields: id, subscriptionId, subtotal, tax, total, status, dueDate
 * Status flow: Draft → Confirmed → Paid
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Invoice = sequelize.define(
  'Invoice',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: subscriptionId, subtotal, tax, total, status, dueDate
  },
  {
    tableName: 'invoices',
  }
);

// TODO: belongsTo Subscription; hasMany Payment

module.exports = Invoice;
