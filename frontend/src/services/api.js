import axios from 'axios';

// Uses Vite environment variable if set, otherwise defaults to the EC2 backend URL
const API_URL = import.meta.env?.VITE_API_BASE_URL || 'http://3.27.225.67:5000/api';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;