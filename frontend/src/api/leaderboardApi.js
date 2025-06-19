// API service for leaderboard endpoints
import axios from './axios';

const LEADERBOARD_BASE_URL = '/api/leaderboard';

export const leaderboardApi = {
  // Get daily leaderboard
  getDailyLeaderboard: async (date = null, limit = 10) => {
    const params = { limit };
    if (date) {
      params.date = date;
    }
    
    const response = await axios.get(`${LEADERBOARD_BASE_URL}/daily`, { params });
    return response.data;
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async (startDate = null, limit = 10) => {
    const params = { limit };
    if (startDate) {
      params.startDate = startDate;
    }

    console.log(`📤 API Request: GET ${LEADERBOARD_BASE_URL}/weekly with params:`, params);

    try {
      const response = await axios.get(`${LEADERBOARD_BASE_URL}/weekly`, { params });
      console.log(`📥 API Response: ${LEADERBOARD_BASE_URL}/weekly data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`📥 API Error: ${LEADERBOARD_BASE_URL}/weekly:`, error);
      throw error;
    }
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async (year = null, month = null, limit = 10) => {
    const params = { limit };
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await axios.get(`${LEADERBOARD_BASE_URL}/monthly`, { params });
    return response.data;
  },

  // Get yearly leaderboard
  getYearlyLeaderboard: async (year = null, limit = 10) => {
    const params = { limit };
    if (year) params.year = year;
    
    const response = await axios.get(`${LEADERBOARD_BASE_URL}/yearly`, { params });
    return response.data;
  },

  // Get user rank for specific period
  getUserRank: async (userId, periodType, startDate, endDate) => {
    const params = {
      periodType,
      startDate,
      endDate
    };
    
    const response = await axios.get(`${LEADERBOARD_BASE_URL}/user/${userId}/rank`, { params });
    return response.data;
  },

  // Trigger leaderboard recalculation (admin only)
  recalculateLeaderboard: async (periodType, startDate, endDate) => {
    const params = {
      periodType,
      startDate,
      endDate
    };
    
    const response = await axios.post(`${LEADERBOARD_BASE_URL}/recalculate`, null, { params });
    return response.data;
  }
};

export default leaderboardApi;
