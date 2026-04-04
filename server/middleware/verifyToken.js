/**
 * JWT verification — Bearer token; loads user onto req.user (password excluded).
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.error('Authentication required', 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.error('Authentication required', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.error('Server configuration error', 500);
  }

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    return next(err);
  }

  const user = await User.findByPk(payload.id);
  if (!user) {
    return res.error('User not found', 401);
  }

  req.user = user;
  next();
}

module.exports = verifyToken;
