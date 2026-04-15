import axios from 'axios';

// Safely get API Base URL: supports both Vite and Create React App, with fallback.
const getApiBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
      if (process.env.REACT_APP_API_BASE_URL) return process.env.REACT_APP_API_BASE_URL;
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

// Response Interceptor - RENDER 503 HTML SAFETY
// Clones data early to prevent mutation; safely handles HTML error pages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { safeJsonParse } = await import('../utils/safeJsonParser');
    
    // 🔧 FIX: Safely handle Render HTML 503/502 before any parsing and RETRY
    if (error.response?.status === 503 || error.response?.status === 502) {
      const config = error.config;
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < 3 && !config.__skipInterceptorRetry) {
        config.__retryCount += 1;
        
        // Non-blocking toast UX
        if (typeof window !== 'undefined' && config.__retryCount === 1) {
          const toast = document.createElement('div');
          toast.id = "wakeup-toast";
          toast.style.cssText = `
            position:fixed;top:20px;right:20px;z-index:9999;
            padding:16px 20px;border-radius:12px;background:#fef3c7;
            border:1px solid #f59e0b;color:#92400e;font-family:sans-serif;
            font-size:14px;max-width:340px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);
            animation:toastIn 0.25s ease-out;
          `;
          toast.innerHTML = `⏳ Server is waking up, please wait...`;
          document.body.appendChild(toast);
          setTimeout(() => {
            const el = document.getElementById("wakeup-toast");
            if (el) el.remove();
          }, 15000); // Wait until all retries are roughly done
        }
        
        console.warn(`🚀 Render ${error.response.status} detected. Retrying in 5s... (${config.__retryCount}/3)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return api(config);
      }
      
      // If we exhausted retries, format the error nicely
      const rawData = error.response.data;
      const htmlErrorMsg = typeof rawData === 'string' ? rawData.substring(0, 100) : String(rawData || '').substring(0, 100);
      const safeError = {
        ...error,
        response: {
          ...error.response,
          data: {
            success: false,
            message: 'Server waking up (Render cold start/Bad Gateway). Please retry in a moment.',
            status: error.response.status,
            renderColdStart: true,
            rawHint: htmlErrorMsg.includes('You need t') || htmlErrorMsg.includes('JavaScript')
          }
        }
      };
      
      return Promise.reject(safeError);
    }
    
    // 401: Clear auth & redirect
    if (error.response?.status === 401) {
      console.log('401 - clearing auth:', error.config?.url);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch(e){}
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Other HTTP errors: Safely parse data
    if (error.response?.data && typeof error.response.data === 'string') {
      error.response.data = safeJsonParse(error.response.data, 
        { success: false, message: `Server error (${error.response.status})` },
        `axios-${error.config?.url}`
      );
    }
    
    // Log unhandled
    if (error.response?.status >= 500) {
      console.error(`Server Error ${error.response.status}:`, error.response.data);
    } else if (error.response?.status === 404) {
      console.error(`API 404: ${error.config?.url}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;
