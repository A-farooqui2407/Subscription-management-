/**
 * OrderLine — fields: id, subscriptionId, productId, qty, unitPrice, taxId, amount
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderLine = sequelize.define(
  'OrderLine',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: subscriptionId, productId, qty, unitPrice, taxId (nullable), amount
  },
  {
    tableName: 'order_lines',
  }
);

// TODO: belongsTo Subscription, Product, Tax

module.exports = OrderLine;
