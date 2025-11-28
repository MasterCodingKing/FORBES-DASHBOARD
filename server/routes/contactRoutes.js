const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route
router.post('/', contactController.sendContactForm);

module.exports = router;
