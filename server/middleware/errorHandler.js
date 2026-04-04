/**
 * Global error handler — Sequelize validation/unique, JWT, default 500.
 * Must be registered last (after routes and 404).
 */
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

const isDev = process.env.NODE_ENV !== 'production';

function validationFieldErrors(err) {
  if (!err.errors || !Array.isArray(err.errors)) return null;
  return err.errors.map((e) => ({
    field: e.path != null ? e.path : null,
    message: e.message,
  }));
}

function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);

  let status = 500;
  let message = 'Internal server error';
  /** @type {null | Array<{ field: string | null, message: string }>} */
  let errors = null;
  let meta = null;

  if (err instanceof ValidationError) {
    status = 400;
    message = 'Validation failed';
    errors = validationFieldErrors(err);
  } else if (err instanceof UniqueConstraintError) {
    status = 409;
    message = 'already exists';
    errors = null;
  } else if (err instanceof TokenExpiredError) {
    status = 401;
    message = 'Token expired';
    errors = null;
  } else if (err instanceof JsonWebTokenError) {
    status = 401;
    message = 'Invalid token';
    errors = null;
  } else if (err.status && Number.isInteger(err.status)) {
    status = err.status;
    message = err.message || message;
  }

  if (isDev && err.stack) {
    meta = { stack: err.stack };
  }

  res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
    meta,
  });
}

module.exports = errorHandler;
