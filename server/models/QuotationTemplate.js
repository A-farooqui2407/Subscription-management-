/**
 * Quotation template — plan + JSON product lines for quick quotes.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuotationTemplate = sequelize.define(
  'QuotationTemplate',
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
    validityDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'plans', key: 'id' },
    },
    productLines: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'quotation_templates',
    paranoid: true,
  }
);

module.exports = QuotationTemplate;
