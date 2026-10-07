import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/public`;

export const getPublicStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};
