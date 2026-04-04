/**
 * Invoice — billing document for a subscription.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const INVOICE_STATUSES = ['draft', 'confirmed', 'paid', 'cancelled'];

const Invoice = sequelize.define(
  'Invoice',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'subscriptions', key: 'id' },
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...INVOICE_STATUSES),
      allowNull: false,
      defaultValue: 'draft',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'invoices',
    paranoid: true,
    hooks: {
      beforeCreate: (inv) => {
        if (!inv.invoiceNumber) {
          inv.invoiceNumber = `INV-${Date.now()}`;
        }
      },
    },
  }
);

module.exports = Invoice;
