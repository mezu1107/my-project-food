// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add auth token if exists (for admin)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fully typed & compatible with React Query v5
export const apiClient = {
  get: <T>(url: string, config = {}) =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config = {}) =>
    api.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config = {}) =>
    api.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: any, config = {}) =>
    api.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config = {}) =>
    api.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;