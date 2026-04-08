// Frontend/src/services/api.js
// Central axios instance — auto-attaches token, auto-refreshes on 401

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://luxe-ecommerce-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ─────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxe_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: silent token refresh on 401 ────
let refreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only retry on 401, not on /refresh itself
    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/refresh') {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.accessToken;
        localStorage.setItem('luxe_access_token', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('luxe_access_token');
        window.dispatchEvent(new Event('luxe:session-expired'));
        return Promise.reject(refreshErr);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
