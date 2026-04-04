/**
 * Recurring plan — pricing, billing cadence, lifecycle flags.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plan = sequelize.define(
  'Plan',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    billingPeriod: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
    },
    minQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    autoClose: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    closable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    pausable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    renewable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'plans',
    paranoid: true,
  }
);

module.exports = Plan;
