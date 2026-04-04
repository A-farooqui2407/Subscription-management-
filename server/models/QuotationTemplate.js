/**
 * QuotationTemplate — fields: id, name, validityDays, planId, productLines (JSON)
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuotationTemplate = sequelize.define(
  'QuotationTemplate',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: name, validityDays, planId (FK), productLines (JSON/JSONB)
  },
  {
    tableName: 'quotation_templates',
  }
);

// TODO: belongsTo Plan

module.exports = QuotationTemplate;
