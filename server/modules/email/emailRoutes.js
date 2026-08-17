const express = require('express');
const router = express.Router();
const { sendTestEmail, sendCustomEmail } = require('./emailController');

// @route   POST /api/email/test
router.post('/test', sendTestEmail);

// @route   POST /api/email/send
router.post('/send', sendCustomEmail);

module.exports = router;
