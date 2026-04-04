/**
 * Product — fields: id, name, productType, salesPrice, costPrice
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: name, productType, salesPrice, costPrice
  },
  {
    tableName: 'products',
  }
);

// TODO: hasMany Variant, hasMany OrderLine

module.exports = Product;
