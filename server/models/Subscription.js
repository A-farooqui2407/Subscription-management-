/**
 * Subscription — lifecycle, totals, order lines.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subscription = sequelize.define(
  'Subscription',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    subscriptionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'contacts', key: 'id' },
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'plans', key: 'id' },
    },
    discountId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'discounts', key: 'id' },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'quotation', 'confirmed', 'active', 'closed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'subscriptions',
    paranoid: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['customerId'] },
      { fields: ['planId'] },
    ],
    hooks: {
      beforeCreate: (sub) => {
        if (!sub.subscriptionNumber) {
          sub.subscriptionNumber = `SUB-${Date.now()}`;
        }
      },
    },
  }
);

module.exports = Subscription;
