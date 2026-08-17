import axios from 'axios';
import { INDIAN_STATES, getDistrictsByState } from '../data/indianStatesDistricts';

const API_BASE = 'http://localhost:5000/api/locations';

// In-memory cache for client-side queries
const pincodeCache = new Map();
const districtCitiesCache = new Map();

/**
 * Get list of all Indian States and Union Territories
 */
export const getStates = () => {
  return INDIAN_STATES;
};

/**
 * Get list of districts for a given Indian State
 */
export const getDistricts = (state) => {
  return getDistrictsByState(state);
};

/**
 * Lookup Indian PIN Code details (State, District, Post Offices/Cities)
 * @param {string} pincode 6-digit numeric PIN code
 * @returns {Promise<{success: boolean, state: string, district: string, postOffices: string[], pincode: string}>}
 */
export const lookupPincode = async (pincode) => {
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return {
      success: false,
      message: 'PIN code must be exactly 6 digits.',
    };
  }

  // Check client cache first
  if (pincodeCache.has(pincode)) {
    return pincodeCache.get(pincode);
  }

  try {
    const response = await axios.get(`${API_BASE}/pincode/${pincode}`, {
      timeout: 8000,
    });

    if (response.data && response.data.success) {
      pincodeCache.set(pincode, response.data);
      return response.data;
    }

    return {
      success: false,
      message: response.data?.message || 'PIN code not found.',
    };
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Location lookup timed out. Please try again.'
        : 'Failed to look up PIN code.');
    return {
      success: false,
      message: msg,
    };
  }
};

/**
 * Get cities / post offices by District name
 * @param {string} district
 * @returns {Promise<{success: boolean, cities: string[]}>}
 */
export const getCitiesByDistrict = async (district) => {
  if (!district || district.trim().length < 2) {
    return { success: true, cities: [] };
  }

  const key = district.trim().toLowerCase();
  if (districtCitiesCache.has(key)) {
    return { success: true, cities: districtCitiesCache.get(key) };
  }

  try {
    const response = await axios.get(`${API_BASE}/cities`, {
      params: { district: district.trim() },
      timeout: 8000,
    });

    if (response.data && response.data.success) {
      const cities = response.data.cities || [];
      districtCitiesCache.set(key, cities);
      return { success: true, cities };
    }

    return { success: true, cities: [] };
  } catch (error) {
    console.error('Error fetching cities by district:', error);
    return { success: true, cities: [] };
  }
};

export default {
  getStates,
  getDistricts,
  lookupPincode,
  getCitiesByDistrict,
};
