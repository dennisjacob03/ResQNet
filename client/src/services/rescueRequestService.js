import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/rescue-requests`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("resqnet_token")}`,
  },
});

// User: Submit a new rescue distress report
export const createRescueRequest = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  const response = await axios.post(`${API_URL}`, formData, {
    headers: {
      ...getAuthHeader().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// User: Get all submitted rescue requests
export const getUserRescueRequests = async () => {
  const response = await axios.get(`${API_URL}/my-requests`, getAuthHeader());
  return response.data;
};

// Admin: Get all rescue reports with broadcast and assignment state
export const getAdminRescueRequests = async () => {
  const response = await axios.get(`${API_URL}/admin/all`, getAuthHeader());
  return response.data;
};

// Common: Get detailed rescue request by ID with live tracking
export const getRescueRequestById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Rescue Team: Get incoming broadcast requests in operating area
export const getRescueTeamBroadcasts = async () => {
  const response = await axios.get(`${API_URL}/broadcasts`, getAuthHeader());
  return response.data;
};

// Rescue Team: Accept rescue request (nearest team will be assigned)
export const acceptRescueRequest = async (id) => {
  const response = await axios.post(
    `${API_URL}/${id}/accept`,
    {},
    getAuthHeader(),
  );
  return response.data;
};

// Rescue Team: Decline rescue request
export const declineRescueRequest = async (id, reason) => {
  const response = await axios.post(
    `${API_URL}/${id}/decline`,
    { reason },
    getAuthHeader(),
  );
  return response.data;
};

// Rescue Team: Update operation stage & push vehicle GPS location
export const updateRescueStage = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/${id}/stage`,
    data,
    getAuthHeader(),
  );
  return response.data;
};

// Rescue Team: Get nearby shelters with capacity for intake
export const getNearbySheltersForIntake = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}/nearby-shelters`,
    getAuthHeader(),
  );
  return response.data;
};

// Rescue Team: Route to destination shelter & inform shelter
export const routeToShelter = async (id, data) => {
  const response = await axios.post(
    `${API_URL}/${id}/route-shelter`,
    data,
    getAuthHeader(),
  );
  return response.data;
};

// Shelter: Get all incoming rescue intakes routed to this shelter
export const getShelterIncomingIntakes = async () => {
  const response = await axios.get(
    `${API_URL}/shelter-incoming`,
    getAuthHeader(),
  );
  return response.data;
};

// Shelter: Confirm animal admission
export const confirmShelterAdmission = async (id, data = {}) => {
  const response = await axios.post(
    `${API_URL}/${id}/confirm-admission`,
    data,
    getAuthHeader(),
  );
  return response.data;
};

// Public/User: Get map data for all active rescue teams and shelters
export const getAllRescueTeamsAndSheltersMap = async () => {
  const response = await axios.get(`${API_URL}/map-data`, getAuthHeader());
  return response.data;
};
