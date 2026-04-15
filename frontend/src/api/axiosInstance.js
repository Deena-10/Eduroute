import axios from 'axios';

// Safely get API Base URL: supports both Vite and Create React App, with fallback.
const getApiBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
  } catch (e) {}
  // Default Render backend if env is missing
  return 'https://eduroute-1.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor
api.interceptors.request.use(config => {
  let token;
  try {
    token = localStorage.getItem('token');
    // Clear HTML-like tokens to prevent backend crashes
    if (token && (token.includes('You need') || token.includes('Sign in wi') || token.startsWith('<!') || token.startsWith('<html'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      token = null;
    }
  } catch (e) {
    token = null;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Axios safely parses standard JSON to response.data automatically
    return response;
  },
  (error) => {
    // 503 Error (e.g. Supabase or Render backend waking up)
    if (error.response?.status === 503) {
      console.warn("Server waking up, please try again in a few seconds");
      alert("Server is currently waking up, please try again in a few seconds.");
    }
    
    // 401 Unauthorized
    else if (error.response?.status === 401) {
      console.log('401 error received from API, clearing auth data:', error.config?.url);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('Failed to clear auth storage on 401:', e);
      }
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 404 Not Found
    else if (error.response?.status === 404) {
      console.error(`API endpoint not found (404): ${error.config?.url}`);
    }

    // 500 Internal Server Error
    else if (error.response?.status === 500) {
      console.error('Internal Server Error. The backend encountered a problem.');
    }

    // Fallback error logging
    else if (error.message && error.message.includes('JSON')) {
      console.error('JSON Parsing Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
