/**
 * Contacts — authenticated Internal + Admin (enforced on routes).
 */
const { Op } = require('sequelize');
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const { validateIndianPhone } = require('../utils/phoneValidator');

const CONTACT_TYPES = ['customer', 'subscriber'];

const getAllContacts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  const type = req.query.type;
  if (type !== undefined && type !== '') {
    if (!CONTACT_TYPES.includes(type)) {
      return res.error('Invalid type filter', 400);
    }
    where.type = type;
  }

  const { count, rows } = await Contact.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.paginated(rows, count, page, limit);
});

const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    return res.error('Contact not found', 404);
  }
  return res.success(contact.get({ plain: true }), 'Success', 200);
});

const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, type } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.error('Name and email are required', 400);
  }

  // Validate type
  if (type !== undefined && type !== '' && !CONTACT_TYPES.includes(type)) {
    return res.error('Invalid type', 400);
  }

  // Validate phone format if provided
  if (phone && phone.trim() !== '' && !validateIndianPhone(phone)) {
    return res.error('Invalid phone number format. Please provide a valid Indian phone number (10 digits starting with 6-9, or +91XXXXXXXXXX)', 400);
  }

  // Check for duplicate email
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await Contact.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    return res.error('Email already exists', 409);
  }

  try {
    const contact = await Contact.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone != null && phone !== '' ? String(phone).trim() : null,
      type: type && CONTACT_TYPES.includes(type) ? type : 'customer',
      createdBy: req.user.id,
    });

    return res.success(contact.get({ plain: true }), 'Contact created', 201);
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.error('Validation failed: ' + error.errors.map(e => e.message).join(', '), 400);
    }
    throw error;
  }
});

const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    return res.error('Contact not found', 404);
  }

  const { name, email, phone, type } = req.body;

  // Validate and update email
  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const taken = await Contact.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: contact.id },
      },
    });
    if (taken) {
      return res.error('Email already exists', 409);
    }
    contact.email = normalizedEmail;
  }

  // Update name
  if (name !== undefined) {
    contact.name = String(name).trim();
  }

  // Validate and update phone
  if (phone !== undefined) {
    if (phone && phone.trim() !== '' && !validateIndianPhone(phone)) {
      return res.error('Invalid phone number format. Please provide a valid Indian phone number (10 digits starting with 6-9, or +91XXXXXXXXXX)', 400);
    }
    contact.phone = phone != null && phone !== '' ? String(phone).trim() : null;
  }

  // Validate and update type
  if (type !== undefined) {
    if (!CONTACT_TYPES.includes(type)) {
      return res.error('Invalid type', 400);
    }
    contact.type = type;
  }

  try {
    await contact.save();
    return res.success(contact.get({ plain: true }), 'Contact updated', 200);
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.error('Validation failed: ' + error.errors.map(e => e.message).join(', '), 400);
    }
    throw error;
  }
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    return res.error('Contact not found', 404);
  }

  await contact.destroy();
  return res.success(null, 'Contact deleted successfully', 200);
});

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
