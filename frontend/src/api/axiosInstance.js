import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
});

axiosInstance.interceptors.request.use(config => {
  let token;
  try {
    token = localStorage.getItem('token');
    // Never send or trust HTML/noscript stored as token (avoids "You need t"... is not valid JSON)
    if (token && (token.includes('You need') || token.startsWith('<!') || token.startsWith('<html'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      token = null;
    }
  } catch (e) {
    token = null;
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    const contentType = String(response.headers?.['content-type'] || '');
    const looksLikeHtml = typeof response.data === 'string' && /<!doctype html|<html|You need to enable JavaScript/i.test(response.data);
    if (!contentType.includes('application/json') && looksLikeHtml) {
      const err = new Error('Non-JSON (HTML) response received from API. Check API base URL / routing.');
      err.name = 'NonJsonResponseError';
      err.response = response;
      throw err;
    }
    return response;
  },
  error => {
    // Enhanced error handling for JSON parsing issues
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url);
    }
    
    if (error.response?.status === 401) {
      console.log('401 error received from API, logging out:', error.config?.url);
      // For any API 401, clear auth data and redirect to login
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
    
    // Check for JSON parsing errors in response
    if (error.message && error.message.includes('JSON')) {
      console.warn('JSON parsing error in response:', error.message);
      // Clear potentially corrupted data
      const keysToCheck = ['user', 'token'];
      keysToCheck.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value && value.includes('You need t')) {
            localStorage.removeItem(key);
            console.log(`Removed corrupted key: ${key}`);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      });
    }

    // Detect HTML responses where JSON was expected (common misrouting symptom)
    const responseData = error.response?.data;
    if (typeof responseData === 'string' && /<!doctype html|<html|You need to enable JavaScript/i.test(responseData)) {
      console.error('HTML received from API endpoint. Likely incorrect baseURL or reverse-proxy routing:', {
        baseURL: API_BASE_URL,
        url: error.config?.url,
        status: error.response?.status,
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
