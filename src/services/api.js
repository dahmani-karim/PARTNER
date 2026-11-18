import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Request interceptor: ajouter le JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('partner-token');
  const anonymous = /\/auth\/local(?:\/register)?$/.test(config.url);
  if (token && !anonymous) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: gérer les 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('partner-token');
    if (token && error.response?.status === 401 && error.config?.headers?.Authorization === `Bearer ${token}`) {
      window.dispatchEvent(new CustomEvent('partner-session-expired', { detail: { token } }));
    }
    return Promise.reject(error);
  }
);

export default api;
