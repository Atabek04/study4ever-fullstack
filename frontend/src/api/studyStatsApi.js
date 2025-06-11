import api from './axios.js';

const STATS_BASE_PATH = '/api/v1/sessions/stats';

// Helper function to extract user ID from JWT token
const getUserIdFromToken = () => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.sub || tokenPayload.username || tokenPayload.preferred_username;
    } catch (error) {
      console.warn('StudyStats API: Could not extract userId from token:', error);
    }
  }
  
  return null;
};

/**
 * Get daily study statistics for a user
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Promise} Daily statistics data
 */
export const getDailyStats = async (days = 30) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STATS_BASE_PATH}/daily`, {
      params: { days },
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }
};

/**
 * Get weekly study statistics for a user
 * @param {number} weeks - Number of weeks to fetch (default: 12)
 * @returns {Promise} Weekly statistics data
 */
export const getWeeklyStats = async (weeks = 12) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STATS_BASE_PATH}/weekly`, {
      params: { weeks },
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    throw error;
  }
};

/**
 * Get monthly study statistics for a user
 /**
 * Get monthly study statistics for a user
 * @param {number} months - Number of months to fetch (default: 12)
 * @returns {Promise} Monthly statistics data
 */
export const getMonthlyStats = async (months = 12) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STATS_BASE_PATH}/monthly`, {
      params: { months },
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    throw error;
  }
};

/**
 * Get yearly study statistics for a user
 * @param {number} years - Number of years to fetch (default: 5)
 * @returns {Promise} Yearly statistics data
 */
export const getYearlyStats = async (years = 5) => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STATS_BASE_PATH}/yearly`, {
      params: { years },
      headers: {
        'X-User-Id': userId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly stats:', error);
    throw error;
  }
};

/**
 * Get study statistics summary for a user
 * @returns {Promise} Statistics summary data
 */
export const getStatsSummary = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STATS_BASE_PATH}/summary`, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    throw error;
  }
};
