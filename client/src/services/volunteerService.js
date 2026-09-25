import axios from 'axios';

const API_URL = 'http://localhost:5000/api/volunteers';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// User: Submit a new volunteer application
export const submitVolunteerApplication = async (data) => {
  const response = await axios.post(`${API_URL}/apply`, data, getAuthHeader());
  return response.data;
};

// User: Get current user's volunteer application(s) and live status
export const getMyVolunteerApplication = async () => {
  const response = await axios.get(`${API_URL}/my-application`, getAuthHeader());
  return response.data;
};

// Admin: Get all volunteer applications
export const getAllVolunteerApplications = async () => {
  const response = await axios.get(`${API_URL}/applications`, getAuthHeader());
  return response.data;
};

// Admin: Schedule an in-person orientation & verification visit
export const scheduleVolunteerVisit = async (id, data) => {
  const response = await axios.put(`${API_URL}/applications/${id}/visit`, data, getAuthHeader());
  return response.data;
};

// Admin: Submit orientation assessment report and record Pass/Fail decision
export const submitVolunteerVisitReport = async (id, data) => {
  const response = await axios.post(`${API_URL}/applications/${id}/visit-report`, data, getAuthHeader());
  return response.data;
};
