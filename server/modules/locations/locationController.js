const axios = require('axios');

const POSTAL_API = 'https://api.postalpincode.in/pincode';
const POSTAL_DISTRICT_API = 'https://api.postalpincode.in/postoffice';

// Simple in-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, ts: Date.now() });
};

// @desc  Lookup PIN code → state, district, post offices
// @route GET /api/locations/pincode/:pincode
// @access Public
const getPincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    // Validate: exactly 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'PIN code must be exactly 6 digits.',
      });
    }

    const cacheKey = `pin:${pincode}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, ...cached });

    const response = await axios.get(`${POSTAL_API}/${pincode}`, { timeout: 8000 });
    const data = response.data;

    if (!data || !Array.isArray(data) || data[0]?.Status === 'Error') {
      return res.status(404).json({
        success: false,
        message: 'PIN code not found. Please check and try again.',
      });
    }

    const result = data[0];
    if (result.Status !== 'Success' || !result.PostOffice?.length) {
      return res.status(404).json({
        success: false,
        message: 'No post offices found for this PIN code.',
      });
    }

    const postOffices = result.PostOffice;
    const firstPO = postOffices[0];

    const normalized = {
      pincode,
      state: firstPO.State,
      district: firstPO.District,
      // Return all unique post offices/localities for this PIN
      postOffices: [...new Set(postOffices.map((po) => po.Name))].sort(),
    };

    setCache(cacheKey, normalized);
    return res.status(200).json({ success: true, ...normalized });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Location service temporarily unavailable. Please try again.',
      });
    }
    console.error('Pincode Lookup Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to look up PIN code. Please try again.',
    });
  }
};

// @desc  Get cities/post offices by district name (India Post search)
// @route GET /api/locations/cities?district=Kottayam
// @access Public
const getCitiesByDistrict = async (req, res) => {
  try {
    const { district } = req.query;

    if (!district || district.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'District name is required.',
      });
    }

    const districtName = district.trim();
    const cacheKey = `district:${districtName.toLowerCase()}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, cities: cached });

    const response = await axios.get(
      `${POSTAL_DISTRICT_API}/${encodeURIComponent(districtName)}`,
      { timeout: 8000 }
    );
    const data = response.data;

    if (!data || !Array.isArray(data) || data[0]?.Status === 'Error') {
      return res.status(200).json({ success: true, cities: [] });
    }

    const result = data[0];
    if (result.Status !== 'Success' || !result.PostOffice?.length) {
      return res.status(200).json({ success: true, cities: [] });
    }

    // Deduplicate + sort city/locality names
    const cities = [...new Set(result.PostOffice.map((po) => po.Name))].sort();
    setCache(cacheKey, cities);

    return res.status(200).json({ success: true, cities });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Location service temporarily unavailable.',
      });
    }
    console.error('Cities Lookup Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cities. Please try again.',
    });
  }
};

module.exports = { getPincode, getCitiesByDistrict };
