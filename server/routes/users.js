/**
 * Users — Admin only.
 */
const express = require('express');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(asyncHandler(verifyToken));
router.use(checkRole('Admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createInternalUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
