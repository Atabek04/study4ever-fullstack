import { useState, useEffect, useCallback } from 'react';
import { getDailyStats, getWeeklyStats, getMonthlyStats, getYearlyStats } from '../api/studyStatsApi';

/**
 * Custom hook for fetching and managing daily study statistics
 * @param {string} userId - User ID
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useDailyStats = (userId, days = 30) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getDailyStats(userId, days);
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch daily statistics');
      console.error('Error in useDailyStats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing weekly study statistics
 * @param {string} userId - User ID
 * @param {number} weeks - Number of weeks to fetch (default: 12)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useWeeklyStats = (userId, weeks = 12) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getWeeklyStats(userId, weeks);
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch weekly statistics');
      console.error('Error in useWeeklyStats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, weeks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing monthly study statistics
 * @param {string} userId - User ID
 * @param {number} months - Number of months to fetch (default: 12)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useMonthlyStats = (userId, months = 12) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getMonthlyStats(userId, months);
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch monthly statistics');
      console.error('Error in useMonthlyStats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, months]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing yearly study statistics
 * @param {string} userId - User ID
 * @param {number} years - Number of years to fetch (default: 5)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useYearlyStats = (userId, years = 5) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getYearlyStats(userId, years);
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch yearly statistics');
      console.error('Error in useYearlyStats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, years]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching all study statistics types
 * @param {string} userId - User ID
 * @returns {Object} { dailyData, weeklyData, monthlyData, yearlyData, loading, error, refetchAll }
 */
export const useAllStats = (userId) => {
  const daily = useDailyStats(userId, 30);
  const weekly = useWeeklyStats(userId, 12);
  const monthly = useMonthlyStats(userId, 12);
  const yearly = useYearlyStats(userId, 5);

  const loading = daily.loading || weekly.loading || monthly.loading || yearly.loading;
  const error = daily.error || weekly.error || monthly.error || yearly.error;

  const refetchAll = useCallback(() => {
    daily.refetch();
    weekly.refetch();
    monthly.refetch();
    yearly.refetch();
  }, [daily.refetch, weekly.refetch, monthly.refetch, yearly.refetch]);

  return {
    dailyData: daily.data,
    weeklyData: weekly.data,
    monthlyData: monthly.data,
    yearlyData: yearly.data,
    loading,
    error,
    refetchAll
  };
};
