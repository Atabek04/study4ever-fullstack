import axios from 'axios';

// Variables to store and cache admin token
let adminToken = null;
let adminTokenExpiry = null;

// Function to create axios instance with proper CORS settings
const createApiInstance = (config = {}) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    },
    withCredentials: false, // Changed to false as we're manually handling auth
    ...config
  });
};

const api = createApiInstance();
export const adminApi = createApiInstance();

// Function to get admin token
export const getAdminToken = async (force = false) => {
  // If we have a cached token and it's not expired, use it unless forced refresh
  if (adminToken && adminTokenExpiry && adminTokenExpiry > Date.now() && !force) {
    return adminToken;
  }
  
  try {
    console.log('Getting new admin token...');
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095'}/api/v1/auth/login`, 
      { username: 'ibnmalik', password: 'Admin@123' }
    );
    
    if (response.data && response.data.accessToken) {
      adminToken = response.data.accessToken;
      // Set expiry to 50 minutes (tokens typically last 1 hour)
      adminTokenExpiry = Date.now() + 50 * 60 * 1000;
      return adminToken;
    } else {
      console.error('Admin login response did not contain access token:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Failed to get admin token:', error);
    return null;
  }
};

// Admin API interceptor to automatically include admin token
adminApi.interceptors.request.use(
  async (config) => {
    const token = await getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (!config.url?.includes('/auth/')) {
        console.log(`Admin Request: ${config.method.toUpperCase()} ${config.url}`);
      }
    } else {
      console.warn(`Admin Request failed - no token: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin API response interceptor
adminApi.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    
    // For important endpoints, log the response body
    if (url?.includes('/courses') || url?.includes('/lessons') || url?.includes('/modules')) {
      console.log(`Admin Response ${response.status} for ${response.config.method.toUpperCase()} ${url}:`, {
        status: response.status,
        data: response.data
      });
    } else if (!url?.includes('/auth/')) {
      // For other non-auth endpoints, just log status
      console.log(`Admin Response ${response.status} for ${response.config.method.toUpperCase()} ${url}`);
    }
    return response;
  },
  async (error) => {
    // If we get a 401 Unauthorized, try refreshing the admin token once
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const newToken = await getAdminToken(true); // Force refresh
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(error.config);
        }
      } catch (refreshError) {
        console.error('Failed to refresh admin token:', refreshError);
      }
    }
    
    // Log error details for non-auth endpoints
    if (!error.config?.url?.includes('/auth/')) {
      console.error(`Admin Error ${error.response?.status} for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Only log non-auth requests to reduce noise
      if (!config.url?.includes('/auth/')) {
        console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    
    // For important endpoints, log the response body
    if (url?.includes('/courses') || url?.includes('/lessons') || url?.includes('/modules')) {
      console.log(`Response ${response.status} for ${response.config.method.toUpperCase()} ${url}:`, {
        status: response.status,
        data: response.data
      });
    } else if (!url?.includes('/auth/')) {
      // For other non-auth endpoints, just log status
      console.log(`Response ${response.status} for ${response.config.method.toUpperCase()} ${url}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(error);
      }
      try {
        const response = await api.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    // Log error details for non-auth endpoints
    if (!error.config?.url?.includes('/auth/')) {
      console.error(`Error ${error.response?.status} for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export default api;
