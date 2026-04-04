/**
 * Discount — fields: id, name, type, value, minPurchase, minQty, startDate, endDate,
 * limitUsage, usedCount, appliesTo
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Discount = sequelize.define(
  'Discount',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: all fields per spec; usedCount increments on successful application
  },
  {
    tableName: 'discounts',
  }
);

// TODO: hasMany Subscription (optional)

module.exports = Discount;
