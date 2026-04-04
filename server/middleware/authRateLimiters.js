/**
 * Rate limits for public auth endpoints (brute-force / abuse mitigation).
 */
const rateLimit = require('express-rate-limit');

const window15m = 15 * 60 * 1000;

/** Login attempts per IP */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, try again shortly.', data: null },
});

/** Signup per IP */
const signupLimiter = rateLimit({
  windowMs: window15m,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many signup attempts.', data: null },
});

/** Forgot / reset password */
const passwordResetLimiter = rateLimit({
  windowMs: window15m,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset requests.', data: null },
});

module.exports = {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
};
