import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storage from '../storage/asyncStorage';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem(storage.keys.TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const criticalAuthEndpoints = ['/auth/verify', '/user/profile'];
      const requestUrl = error.config?.url || '';
      const isCritical = criticalAuthEndpoints.some((endpoint) => requestUrl.includes(endpoint));
      if (isCritical) {
        await storage.removeItem(storage.keys.TOKEN);
        await storage.removeItem(storage.keys.USER);
        // Navigation to Login is handled by AuthContext / ProtectedRoute
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
