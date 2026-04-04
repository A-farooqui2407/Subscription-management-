/**
 * Order line — subscription line item with tax snapshot.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderLine = sequelize.define(
  'OrderLine',
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'variants', key: 'id' },
    },
    taxId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'taxes', key: 'id' },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'order_lines',
  }
);

module.exports = OrderLine;
