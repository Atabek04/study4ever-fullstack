/**
 * Utility functions for managing course progress data
 */

// Event name for course progress updates
export const COURSE_PROGRESS_UPDATED = 'course_progress_updated';

/**
 * Dispatches a custom event when course progress is updated
 * This allows components to react to progress changes and refresh their data
 * 
 * @param {Object} progressData - The updated progress data
 * @param {string} progressData.userId - User ID
 * @param {string} progressData.courseId - Course ID
 * @param {string} progressData.lessonId - Completed lesson ID
 * @param {number} progressData.completionPercentage - New course completion percentage
 */
export const notifyCourseProgressUpdated = (progressData) => {
  if (!progressData || !progressData.courseId) {
    console.warn('Cannot notify course progress update without course ID');
    return;
  }
  
  const event = new CustomEvent(COURSE_PROGRESS_UPDATED, { 
    detail: progressData,
    bubbles: true,
  });
  
  console.log('Dispatching course progress update event:', progressData);
  document.dispatchEvent(event);
};

/**
 * Adds a listener for course progress updates
 * 
 * @param {string} courseId - The course ID to listen for updates on (optional)
 * @param {Function} callback - Function to call when progress is updated
 * @returns {Function} A function to remove the event listener
 */
export const onCourseProgressUpdated = (courseId, callback) => {
  // If first argument is a function, assume it's the callback
  if (typeof courseId === 'function') {
    callback = courseId;
    courseId = null;
  }
  
  const handleEvent = (event) => {
    const progressData = event.detail;
    
    // If a specific courseId was provided, only trigger for that course
    if (courseId && progressData.courseId !== courseId) {
      return;
    }
    
    callback(progressData);
  };
  
  document.addEventListener(COURSE_PROGRESS_UPDATED, handleEvent);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(COURSE_PROGRESS_UPDATED, handleEvent);
  };
};
