/**
 * Payment — fields: id, invoiceId, paymentMethod, amount, paymentDate
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: invoiceId, paymentMethod, amount, paymentDate
  },
  {
    tableName: 'payments',
  }
);

// TODO: belongsTo Invoice; on full payment, set invoice status Paid

module.exports = Payment;
