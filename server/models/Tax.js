/**
 * Tax — percentage or fixed-type tax definition.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tax = sequelize.define(
  'Tax',
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
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'taxes',
    paranoid: true,
  }
);

module.exports = Tax;
