import { useState, useEffect } from 'react';
import api, { adminApi } from '../api/axios';
import { deduplicateRequest, generateModuleProgressKey } from '../utils/requestDeduplication';

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
  // Initialize with localStorage value if available to avoid flicker
  const [isCompleted, setIsCompleted] = useState(() => {
    if (lessonId) {
      return localStorage.getItem(`lesson-${lessonId}-completed`) === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reset state and fetch completion status when lesson changes
  useEffect(() => {
    // Reset completion status when lessonId changes
    setIsCompleted(false);
    setError('');
    
    // Only fetch completion status if we have all required IDs
    if (lessonId && courseId && moduleId) {
      setLoading(true);
      
      // Use a new function to fetch without a closure issue
      const fetchStatus = async () => {
        try {
          // First, check if the lesson is in the list of completed lessons
          // Using the endpoint from LessonProgressController.getCompletedLessons
          const completedLessonsResponse = await api.get(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/completed`);
          const completedLessons = completedLessonsResponse.data || [];
          
          // Set completion status based on whether lesson ID is in the completed list
          // Use type-safe comparison by converting both to strings
          const completed = completedLessons.some(id => String(id) === String(lessonId));
          
          // Reduce logging to avoid console spam
          if (completed) {
            console.log(`[LessonCompletion] Lesson ${lessonId} is completed`);
          }
          
          setIsCompleted(completed);
          
          // Only check module initialization when we have the required IDs
          // This optimizes the system to only check for the current lesson's module
          const cacheKey = `module-${moduleId}-initialized`;
          if (!localStorage.getItem(cacheKey)) {
            try {
              // Quietly check if module is initialized to prepare for later completion
              const progressResponse = await api.get(`/api/v1/courses/${courseId}/modules/${moduleId}/progress`);
              if (progressResponse.status >= 200 && progressResponse.status < 300) {
                console.log(`[LessonCompletion] Module ${moduleId} is already initialized`);
                localStorage.setItem(cacheKey, 'true');
              }
            } catch (checkError) {
              // If we get a 404, module isn't initialized but that's fine - we'll do it when needed
              // We don't log or do anything here to avoid unnecessary console noise
            }
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
      
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [lessonId, courseId, moduleId]);
  
  // Function to initialize module progress if needed
  const initializeModuleIfNeeded = async (moduleId, courseId) => {
    if (!moduleId || !courseId) {
      console.error('[LessonCompletion] Missing required IDs for initialization:', { moduleId, courseId });
      return { success: false, error: 'Missing required IDs for initialization' };
    }
    
    // Check localStorage first to see if we've already initialized this module
    const cacheKey = `module-${moduleId}-initialized`;
    if (localStorage.getItem(cacheKey) === 'true') {
      console.log(`[LessonCompletion] Module ${moduleId} was previously initialized (cached)`);
      return { success: true, cached: true };
    }
    
    // Generate a unique key for this initialization request to deduplicate it
    const requestKey = generateModuleProgressKey(courseId, moduleId);
    
    try {
      // Use deduplication to prevent multiple concurrent initialization attempts
      return await deduplicateRequest(requestKey, async () => {
        // Double check if it's already initialized after getting the lock
        if (localStorage.getItem(cacheKey) === 'true') {
          console.log(`[LessonCompletion] Module ${moduleId} was initialized by another request`);
          return { success: true, cached: true };
        }
        
        // First check if module progress already exists on the server
        try {
          const progressResponse = await api.get(`/api/v1/courses/${courseId}/modules/${moduleId}/progress`);
          if (progressResponse.status >= 200 && progressResponse.status < 300) {
            console.log(`[LessonCompletion] Module progress already exists for module ${moduleId}`);
            localStorage.setItem(cacheKey, 'true'); // Cache that this module is initialized
            return { success: true, exists: true, data: progressResponse.data }; 
          }
        } catch (checkError) {
          // If we get a 404, it means module progress doesn't exist and we should create it
          // Otherwise, log the error but continue trying to initialize
          if (checkError.response?.status !== 404) {
            console.warn(`[LessonCompletion] Error checking module progress:`, checkError);
          } else {
            console.log(`[LessonCompletion] Module progress doesn't exist yet for module ${moduleId}, will create it`);
          }
        }
        
        try {
          // Get module details to know the total lesson count
          console.log(`[LessonCompletion] Getting module details for module ${moduleId}`);
          const moduleResponse = await api.get(`/api/v1/modules/${moduleId}`);
          const { lessonCount } = moduleResponse.data || { lessonCount: 0 };
          
          // Use a reasonable default if lessonCount is missing or zero
          const totalLessons = lessonCount || 1;
          
          // Initialize module progress
          console.log(`[LessonCompletion] Initializing module progress for module ${moduleId} with ${totalLessons} lessons`);
          const response = await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/progress?totalLessonsCount=${totalLessons}`);
          console.log(`[LessonCompletion] Successfully initialized module progress for module ${moduleId}`);
          
          // Cache successful initialization
          localStorage.setItem(cacheKey, 'true');
          
          return { success: true, created: true, data: response.data };
        } catch (initError) {
          console.error('[LessonCompletion] Error during module initialization:', initError);
          throw initError; // Let the outer catch handle it
        }
      }, { retry: true, retryCount: 2, retryDelayMs: 800 });
    } catch (err) {
      // Handle different error cases
      if (err.response?.status === 400) {
        // 400 likely means the module was already initialized by another request
        console.log(`[LessonCompletion] Module ${moduleId} was likely initialized by a concurrent request`);
        localStorage.setItem(cacheKey, 'true'); // Cache it as initialized since it likely exists now
        return { success: true, alreadyInitialized: true };
      } else if (err.response?.status === 404) {
        // Resource not found - could mean the module doesn't exist
        console.error('[LessonCompletion] Module not found during initialization:', err);
        return { success: false, error: 'Module not found', status: 404 };
      } else {
        // Other errors
        console.error('[LessonCompletion] Error initializing module progress:', err);
        return { 
          success: false, 
          error: err.response?.data?.message || 'Unknown error during module initialization',
          status: err.response?.status
        };
      }
    }
  };
  
  // Function to mark lesson as complete
  const markAsComplete = async () => {
    if (!lessonId || !courseId || !moduleId) {
      console.error('[LessonCompletion] Missing required IDs:', { lessonId, courseId, moduleId });
      setError(`Missing required information: ${!moduleId ? 'moduleId' : !courseId ? 'courseId' : 'lessonId'}`);
      
      // If we have lessonId and courseId but no moduleId, try to find moduleId from API
      if (lessonId && courseId && !moduleId) {
        try {
          // Try to fetch lesson details to get moduleId
          const lessonResponse = await api.get(`/api/v1/lessons/${lessonId}`);
          if (lessonResponse.data?.moduleId) {
            console.log(`[LessonCompletion] Found moduleId ${lessonResponse.data.moduleId} for lesson ${lessonId}`);
            // Use the moduleId from the API response
            const apiModuleId = lessonResponse.data.moduleId;
            
            // Continue with the completion process using the found moduleId
            return await completeLesson(lessonId, courseId, apiModuleId);
          }
        } catch (err) {
          console.error('[LessonCompletion] Error fetching lesson details:', err);
        }
      }
      
      return false;
    }
    
    return await completeLesson(lessonId, courseId, moduleId);
  };
  
  // Helper function to complete a lesson with known IDs
  const completeLesson = async (lessonId, courseId, moduleId) => {
    try {
      // First, make sure module progress is initialized before trying to initialize lesson progress
      // This fixes the 404 errors when trying to mark lessons as complete
      console.log(`[LessonCompletion] Initializing module progress if needed for module ${moduleId}`);
      const moduleInitResult = await initializeModuleIfNeeded(moduleId, courseId);
      
      // If module initialization failed, handle the error
      if (!moduleInitResult.success) {
        console.error(`[LessonCompletion] Failed to initialize module progress:`, moduleInitResult.error);
        setError(`Failed to initialize module progress: ${moduleInitResult.error}`);
        return false;
      }
      
      console.log(`[LessonCompletion] Module progress initialized successfully:`, moduleInitResult);
      
      try {
        // Then, initialize progress for this specific lesson
        console.log(`[LessonCompletion] Initializing lesson progress`);
        await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`);
      } catch (lessonInitError) {
        // If we get a 400, it might mean the lesson progress already exists, which is fine
        if (lessonInitError.response?.status === 400) {
          console.log(`[LessonCompletion] Lesson progress already initialized for lesson ${lessonId}`);
        } else {
          // For other errors, we'll still try to mark as complete, but log the error
          console.warn('[LessonCompletion] Error initializing lesson progress (continuing anyway):', lessonInitError);
        }
      }
      
      // Finally mark it as complete using the correct endpoint
      console.log(`[LessonCompletion] Marking lesson ${lessonId} as complete`);
      const response = await api.put(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress/complete`);
      
      // Update the completion status
      setIsCompleted(true);
      
      // Also update localStorage for immediate effect
      localStorage.setItem(`lesson-${lessonId}-completed`, 'true');
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new CustomEvent('lessonCompleted', {
        detail: {
          lessonId,
          courseId,
          moduleId
        }
      }));
      
      // Notify the progress tracking system for the Continue Learning feature
      try {
        const { notifyCourseProgressUpdated } = require('../utils/progressUtils');
        notifyCourseProgressUpdated({
          courseId,
          lessonId,
          moduleId,
          completed: true
        });
      } catch (e) {
        console.warn('[LessonCompletion] Could not notify progress system:', e);
      }
      
      console.log('[LessonCompletion] Successfully marked lesson as complete:', response);
      return true;
    } catch (err) {
      console.error('[LessonCompletion] Error marking lesson as complete:', err);
      
      // Provide more specific error message for different types of failures
      if (err.response?.status === 404) {
        setError('Module or lesson progress needs to be initialized. Please try again.');
        // Try one more initialization attempt and refresh the page
        setTimeout(() => {
          localStorage.removeItem(`module-${moduleId}-initialized`); // Clear cache to force reinitialization
          window.location.reload(); // Refresh the page to retry from scratch
        }, 2000);
      } else if (err.response?.status === 409) {
        setError('Another request is in progress. Please try again in a moment.');
      } else {
        setError('Failed to mark lesson as complete: ' + (err.response?.data?.message || err.message));
      }
      return false;
    }
  };
  
  // Use async method to properly handle the completion
  
  // Function to toggle completion status
  const toggleCompletion = async () => {
    // Get current state to make decision
    const currentlyCompleted = isCompleted;
    
    if (currentlyCompleted) {
      // Currently no API endpoint to mark as incomplete, so this is just UI state
      console.warn('[LessonCompletion] API does not support marking lesson as incomplete (UI-only change)');
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
                const foundLesson = module.lessons?.find(lesson => String(lesson.id) === String(lessonId));
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
