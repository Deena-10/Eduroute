import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log('401 error received:', error.config.url);
      
      // Only redirect to login if this is a critical authentication endpoint
      const criticalAuthEndpoints = ['/auth/verify', '/user/profile'];
      const requestUrl = error.config.url;
      
      // Check if this is a critical auth endpoint that failed
      const isCriticalAuthEndpoint = criticalAuthEndpoints.some(endpoint => 
        requestUrl.includes(endpoint)
      );
      
      if (isCriticalAuthEndpoint) {
        console.log('Critical auth endpoint failed, redirecting to login');
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // For non-critical endpoints, just log the error but don't redirect
        console.log('Non-critical 401 error, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
