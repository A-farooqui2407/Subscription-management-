/**
 * Contacts — any authenticated user (Admin + InternalUser + PortalUser per verifyToken only).
 */
const express = require('express');
const contactController = require('../controllers/contactController');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(asyncHandler(verifyToken));

router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
