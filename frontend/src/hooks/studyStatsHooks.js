import { useState, useEffect, useCallback } from 'react';
import { getDailyStats, getWeeklyStats, getMonthlyStats, getYearlyStats } from '../api/studyStatsApi';

/**
 * Custom hook for fetching and managing daily study statistics
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useDailyStats = (days = 30) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDailyStats(days);
      setData(stats || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch daily statistics';
      setError(errorMessage);
      console.error('Error in useDailyStats:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing weekly study statistics
 * @param {number} weeks - Number of weeks to fetch (default: 12)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useWeeklyStats = (weeks = 12) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getWeeklyStats(weeks);
      setData(stats || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch weekly statistics';
      setError(errorMessage);
      console.error('Error in useWeeklyStats:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing monthly study statistics
 * @param {number} months - Number of months to fetch (default: 12)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useMonthlyStats = (months = 12) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getMonthlyStats(months);
      setData(stats || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch monthly statistics';
      setError(errorMessage);
      console.error('Error in useMonthlyStats:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching and managing yearly study statistics
 * @param {number} years - Number of years to fetch (default: 5)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useYearlyStats = (years = 5) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    console.log('useYearlyStats: fetchStats called with years:', years);
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getYearlyStats(years);
      setData(stats || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch yearly statistics';
      setError(errorMessage);
      console.error('Error in useYearlyStats:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [years]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

/**
 * Custom hook for fetching all study statistics types
 * @returns {Object} { dailyData, weeklyData, monthlyData, yearlyData, loading, error, refetchAll }
 */
export const useAllStats = () => {
  const daily = useDailyStats(30);
  const weekly = useWeeklyStats(12);
  const monthly = useMonthlyStats(12);
  const yearly = useYearlyStats(5);

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
