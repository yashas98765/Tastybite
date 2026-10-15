import axios from 'axios';

// When deployed (e.g. on Vercel), point to the backend URL (e.g. https://tastybite-server.onrender.com)
// When running locally, defaults to '/api' which Vite proxies to localhost:5000
const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tastybite_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking public endpoints
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl && window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('tastybite_token');
        localStorage.removeItem('tastybite_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
