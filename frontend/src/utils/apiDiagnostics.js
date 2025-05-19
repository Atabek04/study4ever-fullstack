import api from '../api/axios';

/**
 * Utility to test API endpoints and debug connection issues
 * 
 * @param {string} endpoint - The API endpoint to test (e.g., '/api/v1/courses')
 * @returns {Promise<object>} - Response data and connection information
 */
export const testApiEndpoint = async (endpoint) => {
  console.log(`Testing API endpoint: ${endpoint}`);
  console.log(`API base URL: ${api.defaults.baseURL}`);
  
  try {
    const startTime = performance.now();
    const response = await api.get(endpoint);
    const endTime = performance.now();
    
    // Return successful response with timing information
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      responseTime: Math.round(endTime - startTime),
      baseUrl: api.defaults.baseURL,
      fullUrl: `${api.defaults.baseURL}${endpoint}`
    };
  } catch (error) {
    // Return formatted error details
    return {
      success: false,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      baseUrl: api.defaults.baseURL,
      fullUrl: `${api.defaults.baseURL}${endpoint}`,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    };
  }
};

/**
 * Utility to check connectivity to the API server
 * 
 * @returns {Promise<object>} - Server connection information
 */
export const checkApiServerConnection = async () => {
  try {
    const startTime = performance.now();
    // Make a simple request to test connectivity
    await fetch(api.defaults.baseURL, { method: 'HEAD' });
    const endTime = performance.now();
    
    return {
      success: true,
      server: api.defaults.baseURL,
      responseTime: Math.round(endTime - startTime)
    };
  } catch (error) {
    return {
      success: false,
      server: api.defaults.baseURL,
      error: error.message
    };
  }
};
