/**
 * Auth routes — public signup/login/reset; protected /me.
 */
const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/me', asyncHandler(verifyToken), authController.getMe);

module.exports = router;
