/**
 * Variant — fields: id, productId, attribute, value, extraPrice
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Variant = sequelize.define(
  'Variant',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: productId (FK), attribute, value, extraPrice
  },
  {
    tableName: 'variants',
  }
);

// TODO: belongsTo Product

module.exports = Variant;
