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
      ? {
          ...statusOrData,
          applicationStatus: statusOrData.applicationStatus || statusOrData.status,
          status: statusOrData.applicationStatus || statusOrData.status,
        }
      : {
          applicationStatus: statusOrData,
          status: statusOrData,
          reviewNote: maybeReviewNote,
        };

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

// Shelter Manager: Get their own shelter details
export const getMyShelter = async () => {
  const response = await axios.get(`${API_URL}/my-shelter`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Update their operational status (OPEN, FULL, UNDER_MAINTENANCE, CLOSED)
export const updateMyShelterStatus = async (shelterStatus) => {
  const response = await axios.patch(
    `${API_URL}/my-shelter/status`,
    { shelterStatus, currentStatus: shelterStatus },
    getAuthHeader()
  );
  return response.data;
};

// Shelter Manager: Get facility capacities
export const getMyShelterCapacities = async () => {
  const response = await axios.get(`${API_URL}/my-shelter/capacities`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Save category capacity
export const saveMyShelterCapacity = async (data) => {
  const response = await axios.post(`${API_URL}/my-shelter/capacities`, data, getAuthHeader());
  return response.data;
};

// Shelter Manager: Delete category capacity
export const deleteMyShelterCapacity = async (capacityId) => {
  const response = await axios.delete(`${API_URL}/my-shelter/capacities/${capacityId}`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Get facility cages
export const getMyShelterCages = async () => {
  const response = await axios.get(`${API_URL}/my-shelter/cages`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Create cage
export const createMyShelterCage = async (data) => {
  const response = await axios.post(`${API_URL}/my-shelter/cages`, data, getAuthHeader());
  return response.data;
};

// Shelter Manager: Update cage
export const updateMyShelterCage = async (cageId, data) => {
  const response = await axios.put(`${API_URL}/my-shelter/cages/${cageId}`, data, getAuthHeader());
  return response.data;
};

// Shelter Manager: Delete cage
export const deleteMyShelterCage = async (cageId) => {
  const response = await axios.delete(`${API_URL}/my-shelter/cages/${cageId}`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Get registered animals
export const getMyShelterAnimals = async () => {
  const response = await axios.get(`${API_URL}/my-shelter/animals`, getAuthHeader());
  return response.data;
};

// Shelter Manager: Register animal in shelter
export const createMyShelterAnimal = async (data) => {
  const response = await axios.post(`${API_URL}/my-shelter/animals`, data, getAuthHeader());
  return response.data;
};

// Admin: Delete a shelter
export const deleteShelter = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};
