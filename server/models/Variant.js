/**
 * Variant — product option (attribute/value) with optional price delta.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Variant = sequelize.define(
  'Variant',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    attribute: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    extraPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'variants',
  }
);

module.exports = Variant;
