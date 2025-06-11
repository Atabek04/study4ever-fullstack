import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { onCourseProgressUpdated } from '../utils/progressUtils';

/**
 * Custom hook to find the next lesson a user should continue with in a course
 * 
 * @param {string} courseId - The ID of the course 
 * @returns {Object} Object containing the next lesson data, loading state, error, and refresh function
 */
export const useContinueLearning = (courseId) => {
  const [nextLesson, setNextLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Memoized fetch function that can be called manually to refresh data
  const fetchNextLesson = useCallback(async (showLoading = true) => {
    if (!courseId) {
      return;
    }
    
    if (showLoading) {
      setLoading(true);
    }
    setError('');
    
    try {
      // Call the new endpoint to get the next lesson to continue with
      const response = await api.get(`/api/v1/courses/${courseId}/continue-learning`);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const nextLessonData = response.data;
        
        // Set the next lesson data
        setNextLesson({
          lessonId: nextLessonData.lessonId,
          lessonTitle: nextLessonData.lessonTitle,
          moduleId: nextLessonData.moduleId,
          moduleTitle: nextLessonData.moduleTitle,
          courseCompletionPercentage: nextLessonData.courseCompletionPercentage,
          lastUpdated: nextLessonData.lastUpdated
        });
        
        // Update last updated timestamp
        setLastUpdated(new Date());
        
        return nextLessonData;
      } else {
        throw new Error(`Failed to fetch next lesson. Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error finding next lesson:', err);
      
      // Handle different error types
      if (!err.response) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else if (err.response.status === 401 || err.response.status === 403) {
        // Authentication/Authorization error
        setError('Authentication error. Please log in again.');
      } else if (err.response.status === 404) {
        // Course or user not found
        setError(`No lessons found for this course.`);
      } else if (err.response.status >= 500) {
        // Server error
        setError('Server error. Please try again later.');
      } else {
        // Other errors
        setError(err.response?.data?.message || 'Failed to find next lesson');
      }
      
      // Fallback to null if we can't get the next lesson
      setNextLesson(null);
      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [courseId]);
  
  // Initial fetch on component mount or when courseId changes
  useEffect(() => {
    if (courseId) {
      fetchNextLesson(true);
    } else {
      setNextLesson(null);
      setError('');
      setLoading(false);
    }
  }, [courseId, fetchNextLesson]);
  
  // Listen for course progress updates to automatically refresh the next lesson
  useEffect(() => {
    if (!courseId) return;
    
    // Create a listener that only responds to the current course
    const cleanup = onCourseProgressUpdated((progressData) => {
      if (progressData.courseId === courseId) {
        console.log(`Detected course progress update for course ${courseId}, refreshing next lesson data`);
        fetchNextLesson(false);
      }
    });
    
    return cleanup;
  }, [courseId, fetchNextLesson]);
  
  return { 
    nextLesson, 
    loading, 
    error, 
    refresh: () => fetchNextLesson(true),
    silentRefresh: () => fetchNextLesson(false),
    lastUpdated 
  };
};
