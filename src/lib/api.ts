// src/lib/api.ts

import axios from "axios";

type AxiosRequestConfig = Parameters<typeof axios.request>[0];

/**
 * Axios instance
 * - Uses VITE_API_URL if provided
 * - Fallback to local backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // required if backend uses cookies
});

/**
 * Attach JWT token to every request
 * Token source: localStorage (authToken)
 */
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

type Config = Partial<AxiosRequestConfig>;

/**
 * Typed API client helpers
 */
export const apiClient = {
  get: <T>(url: string, config?: Config) =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: Config) =>
    api.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: Config) =>
    api.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: any, config?: Config) =>
    api.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: Config) =>
    api.delete<T>(url, config).then((res) => res.data),
};

export { api };
export default apiClient;
