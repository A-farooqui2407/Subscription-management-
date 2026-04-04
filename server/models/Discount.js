/**
 * Discount — rules for cart/subscription reductions.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Discount = sequelize.define(
  'Discount',
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
    type: {
      type: DataTypes.ENUM('fixed', 'percentage'),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    minQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    limitUsage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    appliesTo: {
      type: DataTypes.ENUM('products', 'subscriptions'),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'discounts',
    paranoid: true,
  }
);

module.exports = Discount;
