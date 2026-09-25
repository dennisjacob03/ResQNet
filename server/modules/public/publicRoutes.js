const express = require('express');
const router = express.Router();
const { getPublicStats } = require('./publicController');

// @route   GET /api/public/stats
// @desc    Get real platform statistics and stories
// @access  Public
router.get('/stats', getPublicStats);

module.exports = router;
