import axios from 'axios';

// Dev: same-origin `/api` + Vite proxy avoids wrong-port CORS issues. Prod: set VITE_API_URL.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

const api = axios.create({
  baseURL,
});

// Request interceptor to add JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function isFailedLoginRequest(error) {
  const method = String(error.config?.method || '').toLowerCase();
  if (method !== 'post') return false;
  const url = String(error.config?.url || '');
  // baseURL may be absolute or '/api'; path is usually '/auth/login'
  return url.includes('auth/login') || url.endsWith('/login');
}

// Response interceptor: expired/invalid JWT on protected routes → clear session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isFailedLoginRequest(error)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
