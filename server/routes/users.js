/**
 * Users — Admin only.
 */
const express = require('express');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.use(asyncHandler(verifyToken));
router.use(checkRole('Admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', validateUuid('id'), userController.getUserById);
router.post('/', userController.createInternalUser);
router.put('/:id', validateUuid('id'), userController.updateUser);
router.delete('/:id', validateUuid('id'), userController.deleteUser);

module.exports = router;
