import axios from 'axios';

// Variables to store and cache admin token
let adminToken = null;
let adminTokenExpiry = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
  // Add validation for status
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Resolve for status codes 200-499
  }
});

// Create a separate instance for admin-only API calls
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

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
      
      // Log request details (truncating token for security)
      const truncatedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5);
      console.log(`Admin API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: {
          ...config.headers,
          Authorization: `Bearer ${truncatedToken}`
        },
        baseURL: config.baseURL,
        data: config.data
      });
    } else {
      console.warn(`Admin API Request failed - could not get admin token: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin API response interceptor
adminApi.interceptors.response.use(
  (response) => {
    console.log(`Admin API Response: ${response.status} ${response.statusText} for ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`Admin API Error Response: ${error.response?.status} ${error.response?.statusText} for ${error.config?.method?.toUpperCase() || 'unknown'} ${error.config?.url || 'unknown'}`, error);
    
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
    
    return Promise.reject(error);
  }
);


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log request details for debugging (truncate token for security)
      const truncatedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5);
      console.log(`User API Request: ${config.method.toUpperCase()} ${config.url}`, {
        headers: {
          ...config.headers,
          Authorization: `Bearer ${truncatedToken}`  // Only show parts of the token
        },
        baseURL: config.baseURL,
        data: config.data
      });
    } else {
      console.warn(`User API Request without auth token: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`User API Response: ${response.status} ${response.statusText} for ${response.config.method.toUpperCase()} ${response.config.url}`);
    
    // Special handling for 204 No Content responses
    if (response.status === 204) {
      console.log('Received 204 No Content response');
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token, do not attempt refresh
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
    return Promise.reject(error);
  }
);

export default api;
