import axios from 'axios';

const API_URL = 'http://localhost:5000/api/shelters';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// User: Submit a new shelter registration application
export const submitShelterApplication = async (data) => {
  const response = await axios.post(`${API_URL}/apply`, data, getAuthHeader());
  return response.data;
};

// User: Get their own application status and linked shelter
export const getMyApplication = async () => {
  const response = await axios.get(`${API_URL}/my-application`, getAuthHeader());
  return response.data;
};

// Admin: Get all applications
export const getAllApplications = async () => {
  const response = await axios.get(`${API_URL}/applications`, getAuthHeader());
  return response.data;
};

// Admin: Review a shelter application (Schedule site visit, submit report, approve, reject)
export const reviewApplication = async (id, statusOrData, maybeReviewNote = '') => {
  const payload =
    typeof statusOrData === 'object' && statusOrData !== null
      ? statusOrData
      : { status: statusOrData, reviewNote: maybeReviewNote };

  const response = await axios.put(
    `${API_URL}/applications/${id}/review`,
    payload,
    getAuthHeader()
  );
  return response.data;
};

// Public / Authenticated: Get all registered shelters
export const getAllShelters = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params,
    ...getAuthHeader(),
  });
  return response.data;
};

// Public / Authenticated: Get single shelter details
export const getShelterById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Admin: Directly create a shelter
export const createShelter = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

// Admin / Shelter: Update shelter
export const updateShelter = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

// Admin: Delete a shelter
export const deleteShelter = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};
