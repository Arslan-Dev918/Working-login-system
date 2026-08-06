// ==========================================
// AXIOS API SERVICE CONFIGURATION
// Urdu Comment: Yeh file Axios ke zariye backend API se communication karti hai
// ==========================================

import axios from 'axios';

export interface Product {
  id: number;
  user_id: number;
  name: string;
  category: string;
  brand: string;
  platform: string;
  genre: string;
  condition: string;
  price: number;
  discount_price: number | null;
  stock: number;
  status: 'Available' | 'Out of Stock' | 'Hidden';
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  totalProducts: number;
  availableProducts: number;
  outOfStockProducts: number;
  hiddenProducts: number;
}

export interface ProductListParams {
  page?: number;
  sort?: string;
  q?: string;
  category?: string;
  platform?: string;
  condition?: string;
  status?: string;
}

// Axios Instance Create kar rahe hain
// Urdu Comment: Base URL setup kar rahe hain (Express Backend ke liye)
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
// Urdu Comment: Har request ke sath LocalStorage se JWT Token nikal kar Header mein bhej rahe hain
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Register API Call
 * Urdu Comment: Naye user ko register karne ki request
 */
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await API.post('/register', userData);
  return response.data;
};

/**
 * Login API Call
 * Urdu Comment: User ko login karwane ki request
 */
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await API.post('/login', credentials);
  return response.data;
};

/**
 * Get Profile API Call (Protected)
 * Urdu Comment: Logged-in user ka profile data hasil karne ki request
 */
export const getUserProfile = async () => {
  const response = await API.get('/profile');
  return response.data;
};

/**
 * Logout API Call
 * Urdu Comment: User ke logout hone ki request
 */
export const logoutUser = async () => {
  try {
    const response = await API.post('/logout');
    return response.data;
  } catch (error) {
    console.log('Logout API error:', error);
  }
};

export const getProducts = async (params: ProductListParams = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const searchProducts = async (params: ProductListParams = {}) => {
  const response = await API.get('/products/search', { params });
  return response.data;
};

export const filterProducts = async (params: ProductListParams = {}) => {
  const response = await API.get('/products/filter', { params });
  return response.data;
};

export const getProductStats = async () => {
  const response = await API.get('/products/stats');
  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: FormData) => {
  const response = await API.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProduct = async (id: number, data: FormData) => {
  const response = await API.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

export default API;
