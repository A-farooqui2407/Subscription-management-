/**
 * Contacts — authenticated Internal + Admin (enforced on routes).
 */
const { Op } = require('sequelize');
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

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

  if (!name || !email) {
    return res.error('Name and email are required', 400);
  }

  if (type !== undefined && type !== '' && !CONTACT_TYPES.includes(type)) {
    return res.error('Invalid type', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await Contact.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    return res.error('already exists', 409);
  }

  const contact = await Contact.create({
    name: String(name).trim(),
    email: normalizedEmail,
    phone: phone != null && phone !== '' ? String(phone).trim() : null,
    type: type && CONTACT_TYPES.includes(type) ? type : 'customer',
    createdBy: req.user.id,
  });

  return res.success(contact.get({ plain: true }), 'Contact created', 201);
});

const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    return res.error('Contact not found', 404);
  }

  const { name, email, phone, type } = req.body;

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const taken = await Contact.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: contact.id },
      },
    });
    if (taken) {
      return res.error('already exists', 409);
    }
    contact.email = normalizedEmail;
  }
  if (name !== undefined) {
    contact.name = String(name).trim();
  }
  if (phone !== undefined) {
    contact.phone = phone != null && phone !== '' ? String(phone).trim() : null;
  }
  if (type !== undefined) {
    if (!CONTACT_TYPES.includes(type)) {
      return res.error('Invalid type', 400);
    }
    contact.type = type;
  }

  await contact.save();
  return res.success(contact.get({ plain: true }), 'Contact updated', 200);
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
