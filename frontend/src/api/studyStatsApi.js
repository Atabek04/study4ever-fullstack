import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/progress-service/stats';

// Create axios instance with default config
const studyStatsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
studyStatsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get daily study statistics for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Promise} Daily statistics data
 */
export const getDailyStats = async (userId, days = 30) => {
  try {
    const response = await studyStatsApi.get(`/daily/${userId}`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }
};

/**
 * Get weekly study statistics for a user
 * @param {string} userId - User ID
 * @param {number} weeks - Number of weeks to fetch (default: 12)
 * @returns {Promise} Weekly statistics data
 */
export const getWeeklyStats = async (userId, weeks = 12) => {
  try {
    const response = await studyStatsApi.get(`/weekly/${userId}`, {
      params: { weeks }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    throw error;
  }
};

/**
 * Get monthly study statistics for a user
 * @param {string} userId - User ID
 * @param {number} months - Number of months to fetch (default: 12)
 * @returns {Promise} Monthly statistics data
 */
export const getMonthlyStats = async (userId, months = 12) => {
  try {
    const response = await studyStatsApi.get(`/monthly/${userId}`, {
      params: { months }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    throw error;
  }
};

/**
 * Get yearly study statistics for a user
 * @param {string} userId - User ID
 * @param {number} years - Number of years to fetch (default: 5)
 * @returns {Promise} Yearly statistics data
 */
export const getYearlyStats = async (userId, years = 5) => {
  try {
    const response = await studyStatsApi.get(`/yearly/${userId}`, {
      params: { years }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly stats:', error);
    throw error;
  }
};

export default studyStatsApi;
