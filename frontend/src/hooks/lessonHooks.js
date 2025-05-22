import { useState, useEffect } from 'react';
import api, { adminApi } from '../api/axios';

/**
 * Custom hook to fetch course details including modules and lessons structure
 * 
 * @param {string} courseId - The ID of the course to fetch details for
 * @returns {Object} Object containing course details, loading state, and error
 */
export const useCourseDetails = (courseId) => {
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }
    
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await api.get(`/api/v1/courses/${courseId}/details`);
        
        console.log('Course details response:', response.data);
        
        if (response.status >= 200 && response.status < 300) {
          // Fetch instructor details if available
          let courseData = response.data;

          // Sort modules and lessons by sortOrder
          if (courseData.modules && Array.isArray(courseData.modules)) {
            courseData.modules = [...courseData.modules]
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map(module => ({
                ...module,
                lessons: module.lessons && Array.isArray(module.lessons)
                  ? [...module.lessons].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  : []
              }));
          }
          
          if (courseData.instructorId) {
            try {
              // Use adminApi to fetch instructor details with admin credentials
              const instructorResponse = await adminApi.get(`/api/v1/admin/instructors/${courseData.instructorId}`);
              if (instructorResponse.data) {
                const instructor = instructorResponse.data;
                courseData = {
                  ...courseData,
                  instructor: `${instructor.firstName} ${instructor.lastName}`,
                  instructorEmail: instructor.email,
                  instructorAvatar: instructor.profileImage || null
                };
              }
            } catch (instructorErr) {
              console.error('Error fetching instructor details:', instructorErr);
              // Continue with course data even if instructor details fetch fails
            }
          }
          
          // Fetch completion data for course
          try {
            const completedLessonsResponse = await api.get(`/api/v1/courses/${courseId}/completed`);
            const completedLessons = completedLessonsResponse.data || [];
            
            // Count total lessons in course
            let totalLessons = 0;
            courseData.modules?.forEach(module => {
              totalLessons += module.lessons?.length || 0;
            });
            
            // Add completion stats to course data
            courseData = {
              ...courseData,
              completedLessonsCount: completedLessons.length,
              totalLessonsCount: totalLessons,
              completionPercentage: totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0
            };
          } catch (completionErr) {
            console.error('Error fetching completion data:', completionErr);
            // Continue with course data even if completion data fetch fails
          }
          
          setCourseDetails(courseData);
        } else {
          throw new Error(`Failed to fetch course details. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.response?.data?.message || 'Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId]);
  
  return { courseDetails, loading, error };
};

/**
 * Custom hook to fetch lesson details
 * 
 * @param {string} lessonId - The ID of the lesson to fetch details for
 * @returns {Object} Object containing lesson details, loading state, and error
 */
export const useLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!lessonId) {
      setError('Lesson ID is required');
      setLoading(false);
      return;
    }
    
    const fetchLesson = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await api.get(`/api/v1/lessons/${lessonId}`);
        
        console.log('Lesson response:', response.data);
        
        if (response.status >= 200 && response.status < 300) {
          setLesson(response.data);
        } else {
          throw new Error(`Failed to fetch lesson. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err.response?.data?.message || 'Failed to load lesson. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonId]);
  
  return { lesson, loading, error };
};

/**
 * Custom hook to track module progress
 * 
 * @param {string} moduleId - The ID of the module to track progress for
 * @param {string} courseId - The ID of the course the module belongs to
 * @returns {Object} Object containing module progress information
 */
export const useModuleProgress = (moduleId, courseId) => {
  const [moduleProgress, setModuleProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!moduleId || !courseId) {
      setLoading(false);
      return;
    }
    
    const fetchModuleProgress = async () => {
      setLoading(true);
      
      try {
        // Get module progress directly from the progress service
        const progressResponse = await api.get(`/api/v1/courses/${courseId}/modules/${moduleId}/progress`);
        const progressData = progressResponse.data;
        
        if (progressData) {
          // If we have progress data from the API, use it directly
          setModuleProgress({
            moduleId,
            totalLessons: progressData.totalLessons || 0,
            completedLessons: progressData.completedLessons || 0,
            completionPercentage: progressData.completionPercentage || 0,
            isComplete: progressData.isComplete || false
          });
        } else {
          // Fallback to calculating progress manually if the API doesn't return the expected data
          // Get module details
          const moduleResponse = await api.get(`/api/v1/modules/${moduleId}`);
          const moduleData = moduleResponse.data;
          
          // Get completed lessons in the course
          const completedLessonsResponse = await api.get(`/api/v1/courses/${courseId}/completed`);
          const completedLessons = completedLessonsResponse.data || [];
          
          // Get all lessons in this module
          const courseDetailsResponse = await api.get(`/api/v1/courses/${courseId}/details`);
          const courseData = courseDetailsResponse.data;
          
          // Find the module in course data
          const module = courseData.modules?.find(m => m.id == moduleId);
          if (!module) {
            throw new Error('Module not found in course data');
          }
          
          // Count completed lessons in this module
          const moduleLessonIds = module.lessons.map(lesson => lesson.id);
          const completedModuleLessons = completedLessons.filter(lessonId => 
            moduleLessonIds.includes(lessonId)
          );
          
          // Calculate completion percentage
          const totalLessons = moduleData.lessonCount || moduleLessonIds.length;
          const completedCount = completedModuleLessons.length;
          const completionPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
          
          setModuleProgress({
            moduleId,
            totalLessons,
            completedLessons: completedCount,
            completionPercentage,
            isComplete: completedCount === totalLessons && totalLessons > 0
          });
        }
      } catch (err) {
        console.error('Error fetching module progress:', err);
        setError('Failed to load module progress');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModuleProgress();
  }, [moduleId, courseId]);
  
  return { moduleProgress, loading, error };
};

/**
 * Custom hook to track lesson completion status
 * 
 * @param {string} lessonId - The ID of the lesson to track completion for
 * @param {string} courseId - The ID of the course the lesson belongs to
 * @param {string} moduleId - The ID of the module the lesson belongs to
 * @returns {Object} Object containing completion status and functions to update it
 */
export const useLessonCompletion = (lessonId, courseId, moduleId) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch initial completion status
  useEffect(() => {
    if (!lessonId || !courseId || !moduleId) {
      setLoading(false);
      return;
    }
    
    const fetchCompletionStatus = async () => {
      setLoading(true);
      
      try {
        // First, check if the lesson is in the list of completed lessons
        const completedLessonsResponse = await api.get(`/api/v1/courses/${courseId}/completed`);
        const completedLessons = completedLessonsResponse.data || [];
        
        // Set completion status based on whether lesson ID is in the completed list
        const completed = completedLessons.includes(lessonId);
        setIsCompleted(completed);
        
        // Initialize module progress if this is the first time accessing a lesson in this module
        if (!completed) {
          await initializeModuleIfNeeded(moduleId, courseId);
          
          // Initialize lesson progress
          await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`);
        }
      } catch (err) {
        console.error('Error fetching lesson completion status:', err);
        setError('Failed to load completion status');
        // Default to not completed if error
        setIsCompleted(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompletionStatus();
  }, [lessonId, courseId, moduleId]);
  
  // Function to initialize module progress if needed
  const initializeModuleIfNeeded = async (moduleId, courseId) => {
    try {
      // Get module details to know the total lesson count
      const moduleResponse = await api.get(`/api/v1/modules/${moduleId}`);
      const { lessonCount } = moduleResponse.data;
      
      // Initialize module progress
      await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/progress?totalLessonsCount=${lessonCount}`);
    } catch (err) {
      console.error('Error initializing module progress:', err);
      // We don't want to block the UI flow if this fails
    }
  };
  
  // Function to mark lesson as complete
  const markAsComplete = async () => {
    if (!lessonId || !courseId || !moduleId) return false;
    try {
      // Log request details
      console.log('[LessonCompletion] PUT', `/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress/complete`);
      // Send PUT request to mark lesson as complete
      const response = await api.put(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress/complete`);
      console.log('[LessonCompletion] Response:', response);
      setIsCompleted(true);
      return true;
    } catch (err) {
      console.error('[LessonCompletion] Error marking lesson as complete:', err, err?.response);
      setError('Failed to mark lesson as complete');
      return false;
    }
  };
  
  // Function to toggle completion status
  const toggleCompletion = async () => {
    if (isCompleted) {
      // Currently no API endpoint to mark as incomplete, so this is just UI state
      console.warn('API does not support marking lesson as incomplete');
      setIsCompleted(false);
      return true;
    } else {
      return await markAsComplete();
    }
  };
  
  return {
    isCompleted,
    loading,
    error,
    markAsComplete,
    toggleCompletion
  };
};

/**
 * Custom hook to manage bookmarked lessons
 * 
 * @param {string} lessonId - The ID of the lesson
 * @returns {Object} Object containing bookmark status and toggle function
 */
export const useLessonBookmark = (lessonId) => {
  // Get bookmarks from localStorage
  const getBookmarks = () => {
    const stored = localStorage.getItem('bookmarkedLessons');
    return stored ? JSON.parse(stored) : [];
  };
  
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return getBookmarks().includes(lessonId);
  });
  
  // Save bookmarks to localStorage
  const saveBookmarks = (bookmarks) => {
    localStorage.setItem('bookmarkedLessons', JSON.stringify(bookmarks));
  };
  
  // Toggle bookmark status
  const toggleBookmark = () => {
    const bookmarks = getBookmarks();
    
    if (isBookmarked) {
      // Remove from bookmarks
      const updated = bookmarks.filter(id => id !== lessonId);
      saveBookmarks(updated);
      setIsBookmarked(false);
    } else {
      // Add to bookmarks
      const updated = [...bookmarks, lessonId];
      saveBookmarks(updated);
      setIsBookmarked(true);
    }
    
    return !isBookmarked;
  };
  
  return { isBookmarked, toggleBookmark };
};

/**
 * Custom hook to retrieve and manage all bookmarked lessons
 * 
 * @returns {Object} Object containing all bookmarked lessons and functions to manage them
 */
export const useBookmarkedLessons = () => {
  const [bookmarkedLessons, setBookmarkedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get all bookmarked lessons from localStorage
  useEffect(() => {
    const fetchBookmarkedLessons = async () => {
      setLoading(true);
      
      try {
        // Get bookmarked lesson IDs from localStorage
        const stored = localStorage.getItem('bookmarkedLessons');
        const bookmarkIds = stored ? JSON.parse(stored) : [];
        
        if (bookmarkIds.length === 0) {
          setBookmarkedLessons([]);
          setLoading(false);
          return;
        }
        
        // For each bookmarked lesson ID, fetch the lesson details and its course info
        const enrichedBookmarks = await Promise.all(
          bookmarkIds.map(async (lessonId) => {
            try {
              // Fetch lesson details
              const lessonResponse = await api.get(`/api/v1/lessons/${lessonId}`);
              const lessonData = lessonResponse.data;
              
              // Fetch course details to get course title and module info
              const courseResponse = await api.get(`/api/v1/courses/${lessonData.courseId}/details`);
              const courseData = courseResponse.data;
              
              // Find the module that contains this lesson
              let moduleTitle = 'Unknown Module';
              let moduleId = null;
              
              courseData.modules?.forEach(module => {
                const foundLesson = module.lessons?.find(lesson => lesson.id == lessonId);
                if (foundLesson) {
                  moduleTitle = module.title;
                  moduleId = module.id;
                }
              });
              
              return {
                id: lessonId,
                title: lessonData.title,
                duration: lessonData.duration,
                courseId: lessonData.courseId,
                courseTitle: courseData.title,
                moduleId,
                moduleTitle,
                bookmarkedAt: new Date().toISOString() // We don't store the bookmark time, so we use current time
              };
            } catch (err) {
              console.error(`Error fetching details for bookmarked lesson ${lessonId}:`, err);
              // Return a placeholder for failed fetches
              return {
                id: lessonId,
                title: 'Unknown Lesson',
                courseId: 'unknown',
                courseTitle: 'Unknown Course',
                moduleTitle: 'Unknown Module',
                error: true
              };
            }
          })
        );
        
        setBookmarkedLessons(enrichedBookmarks);
      } catch (err) {
        console.error('Error fetching bookmarked lessons:', err);
        setError('Failed to load bookmarked lessons');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarkedLessons();
  }, []);
  
  // Remove a bookmark
  const removeBookmark = (lessonId) => {
    const stored = localStorage.getItem('bookmarkedLessons');
    const bookmarks = stored ? JSON.parse(stored) : [];
    
    const updated = bookmarks.filter(id => id !== lessonId);
    localStorage.setItem('bookmarkedLessons', JSON.stringify(updated));
    
    // Update state
    setBookmarkedLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
    
    return true;
  };
  
  // Clear all bookmarks
  const clearAllBookmarks = () => {
    localStorage.setItem('bookmarkedLessons', JSON.stringify([]));
    setBookmarkedLessons([]);
    return true;
  };
  
  return {
    bookmarkedLessons,
    loading,
    error,
    removeBookmark,
    clearAllBookmarks
  };
};
