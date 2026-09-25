import axios from 'axios';

const API_URL = 'http://localhost:5000/api/veterinary';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// User: Submit veterinary staff application
export const submitVetStaffApplication = async (data) => {
  const response = await axios.post(`${API_URL}/apply`, data, getAuthHeader());
  return response.data;
};

// User: Get current user's veterinary application status & credentials
export const getMyVetStaffApplication = async () => {
  const response = await axios.get(`${API_URL}/my-application`, getAuthHeader());
  return response.data;
};

// Shelter: Get applications visible to current shelter (targeted or open pool)
export const getShelterVetApplications = async () => {
  const response = await axios.get(`${API_URL}/shelter-applications`, getAuthHeader());
  return response.data;
};

// Shelter: Schedule in-person clinical interview
export const scheduleVetInterview = async (id, data) => {
  const response = await axios.put(`${API_URL}/applications/${id}/interview`, data, getAuthHeader());
  return response.data;
};

// Shelter: Submit clinical evaluation report and approve/assign or reject
export const submitVetInterviewReport = async (id, data) => {
  const response = await axios.post(`${API_URL}/applications/${id}/interview-report`, data, getAuthHeader());
  return response.data;
};

// Vet: Get assigned shelter and active veterinary staff credentials
export const getMyVetAssignment = async () => {
  const response = await axios.get(`${API_URL}/my-assignment`, getAuthHeader());
  return response.data;
};

// Shelter: Get active assigned veterinary staff members
export const getShelterVetStaff = async () => {
  const response = await axios.get(`${API_URL}/shelter-staff`, getAuthHeader());
  return response.data;
};

// Shelter: Toggle medicine stock management permission for a vet staff member
export const toggleVetStaffMedicinePermission = async (staffId) => {
  const response = await axios.put(
    `${API_URL}/shelter-staff/${staffId}/medicine-permission`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// Vet / Shelter: Get animals residing in the assigned shelter
export const getAssignedShelterAnimals = async () => {
  const response = await axios.get(`${API_URL}/animals`, getAuthHeader());
  return response.data;
};

// Vet: Enter clinical examination or surgical report
export const createClinicalRecord = async (data) => {
  const response = await axios.post(`${API_URL}/records`, data, getAuthHeader());
  return response.data;
};

// Vet / Shelter: Get clinical examination and surgical records
export const getClinicalRecords = async (params = {}) => {
  const response = await axios.get(`${API_URL}/records`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

// Vet: Enter vaccination record
export const createVaccinationRecord = async (data) => {
  const response = await axios.post(`${API_URL}/vaccinations`, data, getAuthHeader());
  return response.data;
};

// Vet / Shelter: Get vaccination records
export const getVaccinationRecords = async (params = {}) => {
  const response = await axios.get(`${API_URL}/vaccinations`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

// Vet: Send vaccination or clinical reminder directly to shelter
export const sendShelterAnimalReminder = async (data) => {
  const response = await axios.post(`${API_URL}/reminders/send`, data, getAuthHeader());
  return response.data;
};

// Vet: Get medicine stock items for assigned shelter
export const getMedicineStock = async () => {
  const response = await axios.get(`${API_URL}/medicine-stock`, getAuthHeader());
  return response.data;
};

// Vet: Add a new medicine stock item
export const addMedicineStock = async (data) => {
  const response = await axios.post(`${API_URL}/medicine-stock`, data, getAuthHeader());
  return response.data;
};

// Vet: Update an existing medicine stock item
export const updateMedicineStock = async (id, data) => {
  const response = await axios.put(`${API_URL}/medicine-stock/${id}`, data, getAuthHeader());
  return response.data;
};

// Vet: Delete a medicine stock item
export const deleteMedicineStock = async (id) => {
  const response = await axios.delete(`${API_URL}/medicine-stock/${id}`, getAuthHeader());
  return response.data;
};
