import axios from 'axios';
import { willTokenExpireSoon } from '../utils/tokenUtils';

// Variables to store and cache admin token
let adminToken = null;
let adminTokenExpiry = null;

// Store for the auth context, will be set by the provider
let authContext = null;

// Store for refresh promise to prevent multiple simultaneous refresh attempts
let refreshPromise = null;

// Function to set the auth context (called from AuthContext component)
export const setAuthContext = (context) => {
  authContext = context;
};

// Function to create axios instance with proper CORS settings
const createApiInstance = (config = {}) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
    validateStatus: function (status) {
      return status >= 200 && status < 300; // Only 2xx responses are considered successful
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
    if (!error.response) {
      console.error('Server unavailable while getting admin token:', error);
    } else if (error.response.status >= 500) {
      console.error('Server error while getting admin token:', error);
    } else {
      console.error('Failed to get admin token:', error);
    }
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
    // Don't retry for server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('Server error detected in admin API:', error.response.status);
      return Promise.reject(error);
    }
    
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
  async (config) => {
    const token = localStorage.getItem('accessToken');
    
    // Skip auth checks for auth-related endpoints to avoid infinite loops
    if (config.url?.includes('/auth/')) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
    
    // For all other endpoints, check if we have a token
    if (token) {
      // Check if the token will expire soon
      if (willTokenExpireSoon(token)) {
        console.log('Access token will expire soon, attempting preemptive refresh');
        
        // If we have auth context and refresh token, try to refresh preemptively
        if (authContext && localStorage.getItem('refreshToken')) {
          try {
            // Use a singleton promise to prevent multiple simultaneous refreshes
            if (!refreshPromise) {
              refreshPromise = authContext.extendSession();
              const success = await refreshPromise;
              refreshPromise = null;
              
              if (success) {
                // Get the new token after successful refresh
                const newToken = localStorage.getItem('accessToken');
                config.headers.Authorization = `Bearer ${newToken}`;
                console.log('Preemptive token refresh successful');
              } else {
                console.log('Preemptive token refresh failed');
                // The extendSession will handle the fallback behavior
              }
            } else {
              // Wait for the existing refresh promise to complete
              await refreshPromise;
              const newToken = localStorage.getItem('accessToken');
              if (newToken) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }
            }
          } catch (error) {
            console.error('Error during preemptive token refresh:', error);
            // Continue with the current token
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          // No auth context or refresh token, continue with current token
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Token is still valid, use it
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log non-auth requests
      console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
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
    
    // For progress/completion related endpoints, we'll handle errors in a special way
    // to ensure that the UI doesn't break when these API calls fail
    if (originalRequest?.url?.includes('/progress') || 
        originalRequest?.url?.includes('/complete') || 
        originalRequest?.url?.includes('/completed')) {
      
      console.warn('Progress/completion API call failed, but will continue UI flow:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // For GET requests that check completion status, we'll return an empty array
      // This prevents the UI from breaking when these calls fail
      if (originalRequest?.method?.toLowerCase() === 'get' && 
          (originalRequest?.url?.includes('/completed'))) {
        console.warn('Returning empty completion data as fallback for failed API call');
        return Promise.resolve({ data: [] });
      }
      
      // For progress initialization or completion marking, we'll just log and let the UI continue
      // The UI will update based on localStorage regardless of API success
    }
    
    // Don't retry for server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('Server error detected:', error.response.status);
      return Promise.reject(error);
    }
    
    // Only retry for auth errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 Unauthorized error detected, checking refresh token');

      // Check if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found, redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      // If we have authContext, use the interactive session extension
      if (authContext) {
        console.log('Using interactive session extension dialog');
        return new Promise((resolve, reject) => {
          // Store the request config for later execution
          authContext.pendingRequestsRef.current.push({
            config: originalRequest,
            resolve,
            reject
          });
          
          // Show the session extension dialog
          authContext.setSessionDialogOpen(true);
        });
      } else {
        // Fallback to non-interactive token refresh if authContext is not available
        console.log('No authContext available, falling back to automatic refresh');
        try {
          console.log('Attempting to refresh token automatically');
          const response = await api.post('/api/v1/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          if (accessToken) {
            console.log('Successfully refreshed access token');
            localStorage.setItem('accessToken', accessToken);
          }
          if (newRefreshToken) {
            console.log('Successfully refreshed refresh token');
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
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
