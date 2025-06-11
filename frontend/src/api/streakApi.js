import api from './axios.js';

const STREAK_BASE_PATH = '/api/v1/streaks';

// Helper function to extract user ID from JWT token
const getUserIdFromToken = () => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.sub || tokenPayload.username || tokenPayload.preferred_username;
    } catch (error) {
      console.warn('Streak API: Could not extract userId from token:', error);
    }
  }
  
  return null;
};

/**
 * Get current streak information for a user
 * @returns {Promise} Current streak data
 */
export const getUserStreak = async () => {
  try {
    console.log('getUserStreak: Fetching current streak info');
    
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(STREAK_BASE_PATH, {
      headers: {
        'X-User-Id': userId
      }
    });
    
    console.log('getUserStreak: Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user streak:', error);
    throw error;
  }
};

/**
 * Get streak history for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Streak history data
 */
export const getStreakHistory = async (startDate, endDate) => {
  try {
    console.log('getStreakHistory:: Fetching streak history from', startDate, 'to', endDate);
    
    const userId = getUserIdFromToken();
    console.log('getStreakHistory:: Using userId:', userId);

    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const response = await api.get(`${STREAK_BASE_PATH}/history/by-date-range`, {
      params: { startDate, endDate },
      headers: {
        'X-User-Id': userId
      }
    });

    console.log('getStreakHistory:: Response status:', response.status);
    console.log('getStreakHistory:: Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching streak history:', error);
    throw error;
  }
};

/**
 * Get top streaks leaderboard
 * @param {number} limit - Number of top streaks to fetch (default: 10)
 * @returns {Promise} Top streaks data
 */
export const getTopStreaks = async (limit = 10) => {
  try {
    console.log('getTopStreaks: Fetching top', limit, 'streaks');
    
    const response = await api.get(`${STREAK_BASE_PATH}/top`, {
      params: { limit }
    });
    
    console.log('getTopStreaks: Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching top streaks:', error);
    throw error;
  }
};

/**
 * Reset user's current streak
 * @returns {Promise} Success response
 */
export const resetUserStreak = async () => {
  try {
    console.log('resetUserStreak: Resetting user streak');
    
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    await api.put(`${STREAK_BASE_PATH}/reset`, null, {
      headers: {
        'X-User-Id': userId
      }
    });
    
    console.log('resetUserStreak: Streak reset successfully');
    return { success: true };
  } catch (error) {
    console.error('Error resetting user streak:', error);
    throw error;
  }
};
