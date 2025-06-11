import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { getUserStreak, getStreakHistory, getTopStreaks, resetUserStreak } from '../api/streakApi';

/**
 * Custom hook for fetching and managing user's current streak
 * @returns {Object} { streak, loading, error, refetch }
 */
export const useUserStreak = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreak = useCallback(async () => {
    console.log('useUserStreak: fetchStreak called');
    
    try {
      setLoading(true);
      setError(null);
      console.log('useUserStreak: Fetching user streak...');
      const streakData = await getUserStreak();
      console.log('useUserStreak: Received streak data:', streakData);
      setStreak(streakData);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch streak information';
      setError(errorMessage);
      console.error('Error in useUserStreak:', err);
      setStreak(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, loading, error, refetch: fetchStreak };
};

/**
 * Custom hook for fetching streak history for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format (optional, defaults to 3 months ago)
 * @param {string} endDate - End date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useStreakHistory = (startDate, endDate) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use provided dates or defaults (last 3 months)
  const effectiveStartDate = useMemo(() => {
    if (startDate) return startDate;
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return format(date, 'yyyy-MM-dd');
  }, [startDate]);

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;
    return format(new Date(), 'yyyy-MM-dd');
  }, [endDate]);

  const fetchHistory = useCallback(async () => {
    // Always have dates available now
    console.log('useStreakHistory: Using date range:', effectiveStartDate, 'to', effectiveEndDate);

    try {
      setLoading(true);
      setError(null);
      console.log('useStreakHistory:: Fetching streak history...');
      const historyData = await getStreakHistory(effectiveStartDate, effectiveEndDate);
      console.log('useStreakHistory:: Received history data:', historyData);

      const transformedData = Array.isArray(historyData) ? historyData.map(item => ({
        date: item.date || item.studyDate || item.timestamp,
        streakLength: item.streakLength || item.streakDays || item.value || 0
      })) : [];

      setHistory(transformedData || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch streak history';
      setError(errorMessage);
      console.error('Error in useStreakHistory:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveStartDate, effectiveEndDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);    return { data: history, loading, error, refetch: fetchHistory };
};

/**
 * Custom hook for fetching top streaks leaderboard
 * @param {number} limit - Number of top streaks to fetch (default: 10)
 * @returns {Object} { topStreaks, loading, error, refetch }
 */
export const useTopStreaks = (limit = 10) => {
  const [topStreaks, setTopStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopStreaks = useCallback(async () => {
    console.log('useTopStreaks: fetchTopStreaks called with limit:', limit);
    
    try {
      setLoading(true);
      setError(null);
      console.log('useTopStreaks: Fetching top streaks...');
      const streaksData = await getTopStreaks(limit);
      console.log('useTopStreaks: Received top streaks data:', streaksData);
      setTopStreaks(streaksData || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch top streaks';
      setError(errorMessage);
      console.error('Error in useTopStreaks:', err);
      setTopStreaks([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopStreaks();
  }, [fetchTopStreaks]);

  return { topStreaks, loading, error, refetch: fetchTopStreaks };
};

/**
 * Custom hook for resetting user's streak
 * @returns {Object} { resetStreak, loading, error }
 */
export const useResetStreak = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetStreak = useCallback(async () => {
    console.log('useResetStreak: resetStreak called');
    
    try {
      setLoading(true);
      setError(null);
      console.log('useResetStreak: Resetting streak...');
      await resetUserStreak();
      console.log('useResetStreak: Streak reset successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to reset streak';
      setError(errorMessage);
      console.error('Error in useResetStreak:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetStreak, loading, error };
};
