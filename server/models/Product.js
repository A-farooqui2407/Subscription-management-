/**
 * Product — catalog item with pricing; soft delete.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salesPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    costPrice: {
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
    tableName: 'products',
    paranoid: true,
  }
);

module.exports = Product;
