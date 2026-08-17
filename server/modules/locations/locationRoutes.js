const express = require('express');
const router = express.Router();
const { getPincode, getCitiesByDistrict } = require('./locationController');

// GET /api/locations/pincode/:pincode
router.get('/pincode/:pincode', getPincode);

// GET /api/locations/cities?district=Kottayam
router.get('/cities', getCitiesByDistrict);

module.exports = router;
