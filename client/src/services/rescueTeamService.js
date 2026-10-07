import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/rescues`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// User: Submit a new rescue team application
export const submitRescueTeamApplication = async (data) => {
  const response = await axios.post(`${API_URL}/apply`, data, getAuthHeader());
  return response.data;
};

// User: Get their own rescue team application(s) and status
export const getMyRescueTeamApplication = async () => {
  const response = await axios.get(`${API_URL}/my-application`, getAuthHeader());
  return response.data;
};

// Admin: Get all rescue team applications
export const getAllRescueTeamApplications = async () => {
  const response = await axios.get(`${API_URL}/applications`, getAuthHeader());
  return response.data;
};

// Admin: Schedule a physical team inspection and valuation
export const scheduleTeamVisit = async (id, data) => {
  const response = await axios.put(`${API_URL}/applications/${id}/visit`, data, getAuthHeader());
  return response.data;
};

// Admin: Submit team inspection report and record Pass/Fail decision
export const submitTeamVisitReport = async (id, data) => {
  const response = await axios.post(`${API_URL}/applications/${id}/visit-report`, data, getAuthHeader());
  return response.data;
};
