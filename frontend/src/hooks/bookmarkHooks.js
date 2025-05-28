import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/bookmarks');
      setBookmarks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    refetch: fetchBookmarks
  };
};

export const useBookmarksByCourse = (courseId) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/courses/${courseId}/bookmarks`);
      setBookmarks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching course bookmarks:', err);
      setError('Failed to load course bookmarks');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    refetch: fetchBookmarks
  };
};

export const useBookmarkStatus = (lessonId) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkBookmarkStatus = useCallback(async () => {
    if (!lessonId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/lessons/${lessonId}/bookmark/status`);
      setIsBookmarked(response.data);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
      setIsBookmarked(false);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  // Listen for bookmark changes
  useEffect(() => {
    const handleBookmarkChange = (e) => {
      if (e.detail.lessonId === lessonId) {
        setIsBookmarked(e.detail.isBookmarked);
      }
    };

    window.addEventListener('bookmarkChanged', handleBookmarkChange);
    return () => {
      window.removeEventListener('bookmarkChanged', handleBookmarkChange);
    };
  }, [lessonId]);

  return {
    isBookmarked,
    loading,
    refetch: checkBookmarkStatus
  };
};

export const useBookmarkToggle = (lessonId, courseId, moduleId) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!lessonId) return;
    
    try {
      const response = await api.get(`/api/v1/lessons/${lessonId}/bookmark/status`);
      setIsBookmarked(response.data);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  }, [lessonId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const toggleBookmark = useCallback(async () => {
    if (!lessonId || !courseId || !moduleId) return false;
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await api.delete(`/api/v1/lessons/${lessonId}/bookmark`);
        setIsBookmarked(false);
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('bookmarkChanged', {
          detail: { lessonId, isBookmarked: false }
        }));
      } else {
        await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/bookmark`);
        setIsBookmarked(true);
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('bookmarkChanged', {
          detail: { lessonId, isBookmarked: true }
        }));
      }
      return true;
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [lessonId, courseId, moduleId, isBookmarked]);

  return {
    isBookmarked,
    loading,
    toggleBookmark
  };
};
