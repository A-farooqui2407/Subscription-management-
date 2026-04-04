/**
 * Tax — fields: id, name, percentage, type
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tax = sequelize.define(
  'Tax',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // TODO: name, percentage, type
  },
  {
    tableName: 'taxes',
  }
);

// TODO: hasMany OrderLine (optional)

module.exports = Tax;
