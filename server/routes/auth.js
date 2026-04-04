/**
 * Auth routes — public signup/login/reset; protected /me.
 */
const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../utils/asyncHandler');
const {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
} = require('../middleware/authRateLimiters');

const router = express.Router();

router.post('/signup', signupLimiter, authController.signup);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, authController.resetPassword);
router.get('/me', asyncHandler(verifyToken), authController.getMe);

module.exports = router;
