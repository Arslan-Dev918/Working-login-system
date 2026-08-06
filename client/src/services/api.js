// ==========================================
// AXIOS API CLIENT (client/src/services/api.js)
// Urdu Comment: Client side se backend API kall karne ka module
// ==========================================

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Token attach kar rahe hain
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (data) => {
  const response = await API.post('/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post('/login', data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await API.get('/profile');
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await API.post('/logout');
    return response.data;
  } catch (err) {}
};

export default API;
