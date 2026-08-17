import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
  },
});

// Get user's notifications
export const getMyNotifications = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/read`, {}, getAuthHeader());
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  const response = await axios.patch(`${API_URL}/read-all`, {}, getAuthHeader());
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Create custom notification (for local triggers)
export const createNotification = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

export default {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
};
