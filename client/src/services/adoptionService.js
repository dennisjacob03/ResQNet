import axios from 'axios';

const API_URL = 'http://localhost:5000/api/adoptions';

const getAuthHeader = () => {
  const token = localStorage.getItem('resqnet_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Submit a new adoption application
 */
export const submitAdoptionApplication = async (payload) => {
  const res = await axios.post(API_URL, payload, getAuthHeader());
  return res.data;
};

/**
 * Get all adoption applications submitted by the logged-in user
 */
export const getMyAdoptionApplications = async () => {
  const res = await axios.get(`${API_URL}/my`, getAuthHeader());
  return res.data;
};

/**
 * Check if the user already submitted an application for this pet
 */
export const checkPetApplicationStatus = async (petId) => {
  const res = await axios.get(`${API_URL}/check/${petId}`, getAuthHeader());
  return res.data;
};

/**
 * Shelter / Admin: Get applications with optional status & search query
 */
export const getShelterAdoptionApplications = async (params = {}) => {
  const res = await axios.get(`${API_URL}/shelter`, {
    ...getAuthHeader(),
    params,
  });
  return res.data;
};

/**
 * Get details of a single adoption application
 */
export const getAdoptionApplicationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};

/**
 * Shelter / Admin: Update application status (Under Review, Approved, Rejected)
 */
export const updateAdoptionApplicationStatus = async (id, application_status, remarks = '') => {
  const res = await axios.put(
    `${API_URL}/${id}/status`,
    { application_status, remarks },
    getAuthHeader()
  );
  return res.data;
};

/**
 * Shelter / Admin: Schedule a shelter visit appointment for the applicant
 */
export const scheduleAdoptionAppointment = async (id, appointmentData) => {
  const res = await axios.put(
    `${API_URL}/${id}/appointment`,
    appointmentData,
    getAuthHeader()
  );
  return res.data;
};

/**
 * Shelter / Admin: Submit a shelter visit inspection report and decide (Approved / Rejected)
 */
export const submitShelterVisitReport = async (id, reportData) => {
  const res = await axios.post(
    `${API_URL}/${id}/visit-report`,
    reportData,
    getAuthHeader()
  );
  return res.data;
};

/**
 * Applicant: Withdraw an application
 */
export const withdrawAdoptionApplication = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/withdraw`, {}, getAuthHeader());
  return res.data;
};
