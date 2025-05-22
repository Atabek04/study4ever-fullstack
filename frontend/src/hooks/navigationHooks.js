import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook to find the first lesson of a course
 * 
 * @param {string} courseId - The ID of the course 
 * @returns {Object} Object containing the first lesson ID, loading state, and error
 */
export const useFirstLesson = (courseId) => {
  const [firstLessonId, setFirstLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    
    const fetchFirstLesson = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log(`Fetching course details for courseId: ${courseId} to find first lesson`);
        
        // Fetch the full course details
        const response = await api.get(`/api/v1/courses/${courseId}/details`);
        console.log('Course details response:', response.data);
        
        if (response.status >= 200 && response.status < 300) {
          const courseData = response.data;
          
          // Check if we have modules data
          if (courseData.modules && courseData.modules.length > 0) {
            // Sort modules by order if they have a sortOrder property
            const sortedModules = [...courseData.modules].sort((a, b) => 
              (a.sortOrder || 0) - (b.sortOrder || 0)
            );
            
            // Get the first module
            const firstModule = sortedModules[0];
            
            if (firstModule.lessons && firstModule.lessons.length > 0) {
              // Sort lessons by order if they have a sortOrder property
              const sortedLessons = [...firstModule.lessons].sort((a, b) => 
                (a.sortOrder || 0) - (b.sortOrder || 0)
              );
              
              // Get the first lesson
              const firstLesson = sortedLessons[0];
              
              if (firstLesson && firstLesson.id) {
                console.log(`Found first lesson ID: ${firstLesson.id}`);
                setFirstLessonId(firstLesson.id);
              } else {
                console.warn('First lesson found but no ID available');
                setError('First lesson ID not found');
              }
            } else {
              console.warn('No lessons found in the first module');
              setError('No lessons found in the first module');
            }
          } else {
            console.warn('No modules found in the course details');
            setError('No modules found in the course details');
          }
        } else {
          throw new Error(`Failed to fetch course details. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error finding first lesson:', err);
        setError(err.response?.data?.message || 'Failed to find first lesson');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFirstLesson();
  }, [courseId]);
  
  return { firstLessonId, loading, error };
};
