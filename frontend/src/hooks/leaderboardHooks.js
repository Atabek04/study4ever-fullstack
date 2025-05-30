// Custom hooks for leaderboard data management
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import leaderboardApi from '../api/leaderboardApi';

export const useLeaderboard = (periodType = 'weekly', limit = 10) => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      switch (periodType) {
        case 'daily':
          data = await leaderboardApi.getDailyLeaderboard(params.date, limit);
          break;
        case 'weekly':
          data = await leaderboardApi.getWeeklyLeaderboard(params.startDate, limit);
          break;
        case 'monthly':
          data = await leaderboardApi.getMonthlyLeaderboard(params.year, params.month, limit);
          break;
        case 'yearly':
          data = await leaderboardApi.getYearlyLeaderboard(params.year, limit);
          break;
        default:
          throw new Error(`Invalid period type: ${periodType}`);
      }
      
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [periodType, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
};

export const useUserRank = () => {
  const { user } = useAuth();
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserRank = useCallback(async (periodType, startDate, endDate) => {
    if (!user?.userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await leaderboardApi.getUserRank(user.userId, periodType, startDate, endDate);
      setUserRank(data);
    } catch (err) {
      console.error('Error fetching user rank:', err);
      setError(err.response?.data?.message || 'Failed to fetch user rank');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  return {
    userRank,
    loading,
    error,
    fetchUserRank
  };
};

export const useDailyLeaderboard = (limit = 10) => {
  return useLeaderboard('daily', limit);
};

export const useWeeklyLeaderboard = (limit = 10) => {
  return useLeaderboard('weekly', limit);
};

export const useMonthlyLeaderboard = (limit = 10) => {
  return useLeaderboard('monthly', limit);
};

export const useYearlyLeaderboard = (limit = 10) => {
  return useLeaderboard('yearly', limit);
};

export const useLeaderboardRecalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const recalculateLeaderboard = useCallback(async (periodType, startDate, endDate) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await leaderboardApi.recalculateLeaderboard(periodType, startDate, endDate);
      setSuccess(true);
    } catch (err) {
      console.error('Error recalculating leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to recalculate leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recalculateLeaderboard,
    loading,
    error,
    success
  };
};
