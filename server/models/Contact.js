/**
 * Contact — portal/subscriber customers.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { validateIndianPhone } = require('../utils/phoneValidator');

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
      validate: {
        notEmpty: { msg: 'Contact name cannot be empty' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Please provide a valid email address' } },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidIndianPhone(value) {
          if (value && value.trim() !== '' && !validateIndianPhone(value)) {
            throw new Error('Please provide a valid Indian phone number (10 digits starting with 6-9, or +91XXXXXXXXXX)');
          }
        },
      },
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
