/**
 * Plan — fields: id, name, price, billingPeriod, minQty, startDate, endDate,
 * autoClose, closable, pausable, renewable
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plan = sequelize.define(
  'Plan',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: price, billingPeriod, minQty, date range, boolean flags
  },
  {
    tableName: 'plans',
  }
);

// TODO: hasMany QuotationTemplate, hasMany Subscription

module.exports = Plan;
