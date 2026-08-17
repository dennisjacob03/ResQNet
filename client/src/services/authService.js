import axios from 'axios';

const API_URL ='http://localhost:5000/api/auth';

const authService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer token header dynamically
authService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resqnet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service Methods
export const loginUser = async (credentials) => {
  const response = await authService.post('/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await authService.post('/register', userData);
  return response.data;
};

export const googleLoginUser = async (credential) => {
  const response = await authService.post('/google', { credential });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await authService.get('/me');
  return response.data;
};

export const sendOtpApi = async (email, reason = 'forgot_password', fullName = '') => {
  const response = await authService.post('/send-otp', { email, reason, fullName });
  return response.data;
};

export const verifyOtpApi = async (email, otp, reason = 'forgot_password') => {
  const response = await authService.post('/verify-otp', { email, otp, reason });
  return response.data;
};

export const resetPasswordApi = async (email, otp, newPassword) => {
  const response = await authService.post('/reset-password', { email, otp, newPassword });
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  // If profileData is FormData (includes a file), let axios set multipart headers automatically
  const isFormData = profileData instanceof FormData;
  const response = await authService.put('/profile', profileData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export default authService;
