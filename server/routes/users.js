/**
 * Users — list/read for Admin + Internal + Portal; writes Admin only.
 */
const express = require('express');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

const staffAndPortal = ['Admin', 'InternalUser', 'PortalUser'];

router.get(
  '/',
  asyncHandler(verifyToken),
  checkRole(...staffAndPortal),
  userController.getAllUsers
);
router.get(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole(...staffAndPortal),
  userController.getUserById
);
router.post('/', asyncHandler(verifyToken), checkRole('Admin'), userController.createInternalUser);
router.put(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  userController.updateUser
);
router.delete(
  '/:id',
  validateUuid('id'),
  asyncHandler(verifyToken),
  checkRole('Admin'),
  userController.deleteUser
);

module.exports = router;
