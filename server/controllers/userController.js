/**
 * Internal users directory — Admin only (enforced on routes).
 */
const { Op } = require('sequelize');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendWelcomeEmail } = require('../services/emailService');
const { validatePasswordRules } = require('../utils/passwordPolicy');
const { parsePagination } = require('../utils/pagination');

const ROLES = ['Admin', 'InternalUser', 'PortalUser'];

function toPublicUser(user) {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : user;
  const { password: _p, resetToken: _t, resetExpiry: _e, ...rest } = plain;
  return rest;
}

const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};

  const role = req.query.role;
  if (role !== undefined && role !== '') {
    if (!ROLES.includes(role)) {
      return res.error('Invalid role filter', 400);
    }
    where.role = role;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.paginated(rows.map((u) => toPublicUser(u)), count, page, limit);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.error('User not found', 404);
  }
  return res.success(toPublicUser(user), 'Success', 200);
});

const ASSIGNABLE_ROLES = ['InternalUser', 'PortalUser'];

const createInternalUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.error('Name, email, password, and role are required', 400);
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return res.error('Invalid role. Admins cannot be created via the API.', 400);
  }

  const pwdErrs = validatePasswordRules(password);
  if (pwdErrs.length) {
    return res.error(pwdErrs[0], 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    return res.error('already exists', 409);
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role,
  });

  try {
    await sendWelcomeEmail(user.email, user.name, password);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[users] Welcome email failed (user was still created):', err.message);
  }

  return res.success(toPublicUser(user), 'User created', 201);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.error('User not found', 404);
  }

  const { name, email, role } = req.body;

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const taken = await User.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: user.id },
      },
    });
    if (taken) {
      return res.error('already exists', 409);
    }
    user.email = normalizedEmail;
  }
  if (name !== undefined) {
    user.name = String(name).trim();
  }
  if (role !== undefined) {
    if (user.role === 'Admin') {
      return res.error('Administrator role cannot be changed from the application', 400);
    }
    if (role === 'Admin') {
      return res.error('Cannot assign administrator role via the application', 400);
    }
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.error('Invalid role', 400);
    }
    user.role = role;
  }

  await user.save();
  return res.success(toPublicUser(user), 'User updated', 200);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.error('User not found', 404);
  }

  if (user.id === req.user.id) {
    return res.error('Cannot delete your own account', 400);
  }

  await user.destroy();
  return res.success(null, 'User deleted successfully', 200);
});

module.exports = {
  getAllUsers,
  getUserById,
  createInternalUser,
  updateUser,
  deleteUser,
};
