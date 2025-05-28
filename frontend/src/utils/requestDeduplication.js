/**
 * Request deduplication utility to prevent multiple concurrent requests to the same endpoint
 * This helps prevent race conditions and duplicate API calls
 */

// Store for tracking ongoing requests
const ongoingRequests = new Map();

/**
 * Execute a request with deduplication. If the same request is already in progress,
 * return the existing promise instead of creating a new one.
 * 
 * @param {string} key - Unique key to identify the request
 * @param {Function} requestFunction - Function that returns a promise (the actual API call)
 * @param {Object} options - Additional options for the deduplication
 * @param {number} [options.timeoutMs=5000] - Timeout after which to allow duplicate requests
 * @param {boolean} [options.retry=false] - Whether to retry on failure
 * @param {number} [options.retryCount=3] - Maximum number of retries
 * @param {number} [options.retryDelayMs=500] - Delay between retries in milliseconds
 * @returns {Promise} The request promise
 */
export const deduplicateRequest = async (key, requestFunction, options = {}) => {
  // Default options
  const {
    timeoutMs = 5000,
    retry = false,
    retryCount = 3,
    retryDelayMs = 500
  } = options;

  // Check if this request is already in progress
  if (ongoingRequests.has(key)) {
    console.log(`[RequestDeduplication] Returning existing request for key: ${key}`);
    return ongoingRequests.get(key);
  }

  console.log(`[RequestDeduplication] Starting new request for key: ${key}`);

  // Function to execute request with retry logic
  const executeWithRetry = async (remainingRetries) => {
    try {
      return await requestFunction();
    } catch (error) {
      if (retry && remainingRetries > 0) {
        console.warn(`[RequestDeduplication] Retrying failed request for key: ${key}, ${remainingRetries} retries left`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return executeWithRetry(remainingRetries - 1);
      }
      throw error;
    }
  };

  // Create the request promise with optional retry
  const requestPromise = (retry ? executeWithRetry(retryCount) : requestFunction())
    .then(result => {
      console.log(`[RequestDeduplication] Request completed successfully for key: ${key}`);
      return result;
    })
    .catch(error => {
      console.error(`[RequestDeduplication] Request failed for key: ${key}`, error);
      throw error;
    })
    .finally(() => {
      // Clean up the request from the map when it's done
      ongoingRequests.delete(key);
      console.log(`[RequestDeduplication] Cleaned up request for key: ${key}`);
    });

  // Store the promise in the map
  ongoingRequests.set(key, requestPromise);

  // Set a timeout to clean up the request if it takes too long
  setTimeout(() => {
    if (ongoingRequests.has(key)) {
      console.warn(`[RequestDeduplication] Cleaning up long-running request for key: ${key}`);
      ongoingRequests.delete(key);
    }
  }, timeoutMs);

  return requestPromise;
};

/**
 * Get the current user ID from localStorage or provide a fallback
 * @returns {string} Current user ID or 'guest' if not available
 */
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 'unknown';
    }
  } catch (err) {
    console.error('[RequestDeduplication] Error getting user ID:', err);
  }
  return 'guest';
};

/**
 * Generate a unique key for lesson progress initialization requests
 * 
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @param {string} lessonId - Lesson ID
 * @param {string} [userId] - Optional user ID, will be retrieved from localStorage if not provided
 * @returns {string} Unique request key
 */
export const generateLessonProgressKey = (courseId, moduleId, lessonId, userId) => {
  const actualUserId = userId || getCurrentUserId();
  return `lesson-progress-${actualUserId}-${courseId}-${moduleId}-${lessonId}`;
};

/**
 * Generate a unique key for module progress initialization requests
 * 
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @param {string} [userId] - Optional user ID, will be retrieved from localStorage if not provided
 * @returns {string} Unique request key
 */
export const generateModuleProgressKey = (courseId, moduleId, userId) => {
  const actualUserId = userId || getCurrentUserId();
  return `module-progress-${actualUserId}-${courseId}-${moduleId}`;
};

/**
 * Generate a unique key for lesson completion requests
 * 
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @param {string} lessonId - Lesson ID
 * @param {string} [userId] - Optional user ID, will be retrieved from localStorage if not provided
 * @returns {string} Unique request key
 */
export const generateLessonCompletionKey = (courseId, moduleId, lessonId, userId) => {
  const actualUserId = userId || getCurrentUserId();
  return `lesson-completion-${actualUserId}-${courseId}-${moduleId}-${lessonId}`;
};

/**
 * Generate a unique key for completed lessons fetch requests
 * 
 * @param {string} courseId - Course ID
 * @param {string} [userId] - Optional user ID, will be retrieved from localStorage if not provided
 * @returns {string} Unique request key
 */
export const generateCompletedLessonsKey = (courseId, userId) => {
  const actualUserId = userId || getCurrentUserId();
  return `completed-lessons-${actualUserId}-${courseId}`;
};

/**
 * Clear all ongoing requests (useful for cleanup or testing)
 */
export const clearAllRequests = () => {
  console.log(`[RequestDeduplication] Clearing ${ongoingRequests.size} ongoing requests`);
  ongoingRequests.clear();
};

/**
 * Get the number of ongoing requests (useful for debugging)
 * 
 * @returns {number} Number of ongoing requests
 */
export const getOngoingRequestsCount = () => {
  return ongoingRequests.size;
};

/**
 * Check if a request is currently ongoing
 * @param {string} key - Request key to check
 * @returns {boolean} - True if request is ongoing
 */
export const isRequestOngoing = (key) => {
  return ongoingRequests.has(key);
};

/**
 * Get all ongoing request keys - useful for debugging race conditions
 * @returns {Array<string>} Array of keys for ongoing requests
 */
export const getAllOngoingRequestKeys = () => {
  return Array.from(ongoingRequests.keys());
};

/**
 * Debug function to log all current ongoing requests
 * @returns {void}
 */
export const logAllOngoingRequests = () => {
  const keys = getAllOngoingRequestKeys();
  console.log(`[RequestDeduplication] Currently ${keys.length} ongoing requests:`);
  keys.forEach((key, index) => {
    console.log(`  ${index + 1}. ${key}`);
  });
};

/**
 * Adds a unique timestamp to a request key to force a new request
 * Use this when you specifically need to bypass deduplication
 * @param {string} key - Original request key
 * @returns {string} - Key with timestamp added
 */
export const forceNewRequest = (key) => {
  return `${key}-force-${Date.now()}`;
};
