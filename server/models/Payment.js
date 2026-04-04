/**
 * Payment — payment against an invoice.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'upi'];

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'invoices', key: 'id' },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...PAYMENT_METHODS),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
  }
);

module.exports = Payment;
