/**
 * Auth — signup, login, password reset, current user.
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendResetPasswordEmail } = require('../services/emailService');
const { validatePasswordRules } = require('../utils/passwordPolicy');

/** Fixed bcrypt hash so login timing is similar when email is unknown. */
const DUMMY_PASSWORD_HASH =
  '$2b$10$XK0yOWasr8E3GbkOzekPw.eKQ.ALeGcp5d2wuLUg8cEwkc9ZLaPhW';

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function toPublicUser(user) {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : user;
  const { password: _p, resetToken: _t, resetExpiry: _e, ...rest } = plain;
  return rest;
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.error('Name, email, and password are required', 400);
  }

  const pwdErrs = validatePasswordRules(password);
  if (pwdErrs.length) {
    return res.error(pwdErrs[0], 400);
  }

  const existing = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
  if (existing) {
    return res.error('already exists', 409);
  }

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password,
    role: 'PortalUser',
  });

  return res.success(toPublicUser(user), 'Account created', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.error('Email and password are required', 400);
  }

  const user = await User.unscoped().findOne({
    where: { email: String(email).trim().toLowerCase() },
  });

  const hashToCompare = user ? user.password : DUMMY_PASSWORD_HASH;
  const match = await bcrypt.compare(String(password), hashToCompare);

  if (!user || !match) {
    return res.error('Invalid email or password', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.error('Server configuration error', 500);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );

  return res.success(
    {
      token,
      user: toPublicUser(user),
    },
    'Login successful',
    200
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.error('Email is required', 400);
  }

  const user = await User.unscoped().findOne({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = hashResetToken(rawToken);

    user.resetToken = hashed;
    user.resetExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ fields: ['resetToken', 'resetExpiry'] });

    const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    await sendResetPasswordEmail(user.email, resetLink);
  }

  return res.success(
    null,
    'If this email is registered, a reset link has been sent.',
    200
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const rawToken = req.params.token;
  const { newPassword } = req.body;

  if (!rawToken) {
    return res.error('Token is required', 400);
  }

  const hashed = hashResetToken(rawToken);
  const now = new Date();

  const user = await User.unscoped().findOne({
    where: {
      resetToken: hashed,
      resetExpiry: { [Op.gt]: now },
    },
  });

  if (!user) {
    return res.error('Invalid or expired reset token', 400);
  }

  if (!newPassword) {
    return res.error('New password is required', 400);
  }

  const pwdErrs = validatePasswordRules(newPassword);
  if (pwdErrs.length) {
    return res.error(pwdErrs[0], 400);
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetExpiry = null;
  await user.save();

  return res.success(null, 'Password reset successful', 200);
});

const getMe = asyncHandler(async (req, res) => {
  return res.success(toPublicUser(req.user), 'Success', 200);
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
