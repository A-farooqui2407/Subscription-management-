/**
 * Contact — portal/subscriber customers.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Contact = sequelize.define(
  'Contact',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('customer', 'subscriber'),
      allowNull: false,
      defaultValue: 'customer',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'contacts',
  }
);

module.exports = Contact;

const User = require('./User');
Contact.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
