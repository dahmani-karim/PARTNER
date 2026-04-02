import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: ajouter le JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('partner-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: gérer les 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('partner-token');
      localStorage.removeItem('partner-user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;
