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
    console.log('useDailyStats: fetchStats called with days:', days);
    
    try {
      setLoading(true);
      setError(null);
      console.log('useDailyStats: Fetching daily stats...');
      const stats = await getDailyStats(days);
      console.log('useDailyStats: Received stats:', stats);
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
    console.log('useWeeklyStats: fetchStats called with weeks:', weeks);
    
    try {
      setLoading(true);
      setError(null);
      console.log('useWeeklyStats: Fetching weekly stats...');
      const stats = await getWeeklyStats(weeks);
      console.log('useWeeklyStats: Received stats:', stats);
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
    console.log('useMonthlyStats: fetchStats called with months:', months);
    
    try {
      setLoading(true);
      setError(null);
      console.log('useMonthlyStats: Fetching monthly stats...');
      const stats = await getMonthlyStats(months);
      console.log('useMonthlyStats: Received stats:', stats);
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
      console.log('useYearlyStats: Fetching yearly stats...');
      const stats = await getYearlyStats(years);
      console.log('useYearlyStats: Received stats:', stats);
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
  console.log('useAllStats: Hook called');
  
  const daily = useDailyStats(30);
  const weekly = useWeeklyStats(12);
  const monthly = useMonthlyStats(12);
  const yearly = useYearlyStats(5);

  const loading = daily.loading || weekly.loading || monthly.loading || yearly.loading;
  const error = daily.error || weekly.error || monthly.error || yearly.error;

  console.log('useAllStats: Current state:', {
    loading,
    error,
    hasData: {
      daily: daily.data?.length > 0,
      weekly: weekly.data?.length > 0,
      monthly: monthly.data?.length > 0,
      yearly: yearly.data?.length > 0
    }
  });

  const refetchAll = useCallback(() => {
    console.log('useAllStats: Refetching all stats');
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
