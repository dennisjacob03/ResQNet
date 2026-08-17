import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// Admin: Get all users with optional search/filter params
export const getAllUsers = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params,
    ...getAuthHeader(),
  });
  return response.data;
};

// Admin: Get aggregate user stats
export const getUserStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeader());
  return response.data;
};

// Admin: Get single user by ID
export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Admin: Update user status (Active / Inactive / Suspended)
export const updateUserStatus = async (id, status) => {
  const response = await axios.put(
    `${API_URL}/${id}/status`,
    { status },
    getAuthHeader()
  );
  return response.data;
};

// Admin: Update user role
export const updateUserRole = async (id, role) => {
  const response = await axios.put(
    `${API_URL}/${id}/role`,
    { role },
    getAuthHeader()
  );
  return response.data;
};

// Admin: Directly create a new user
export const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData, getAuthHeader());
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export default {
  getAllUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  updateUserRole,
  createUser,
  deleteUser,
};
