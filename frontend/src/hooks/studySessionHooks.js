import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

/**
 * Simple heartbeat hook that sends periodic updates to track study session progress
 * Uses KISS principle - simple, reliable, and focused on core functionality
 * 
 * @param {string} courseId - Current course ID
 * @param {string} moduleId - Current module ID  
 * @param {string} lessonId - Current lesson ID
 * @param {boolean} isActive - Whether to send heartbeats (lesson is actively being viewed)
 * @returns {Object} - Hook state and controls
 */
export const useStudySessionHeartbeat = (courseId, moduleId, lessonId, isActive = true) => {
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const intervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastLocationRef = useRef(null);
  const lastHeartbeatRef = useRef(null);
  const isStartingSessionRef = useRef(false); // Prevent race conditions

  // Configuration
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds - reasonable for study tracking
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes - match backend timeout
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
  
  /**
   * Check if existing session is compatible with current lesson
   */
  const isSessionCompatible = (session, currentCourseId, currentModuleId, currentLessonId) => {
    // If session is for same course, it's compatible (user can navigate within course)
    return session.courseId === currentCourseId;
  };

  /**
   * Start a new study session or get existing active session
   */
  const startSession = async () => {
    if (!courseId || !moduleId || !lessonId) {
      console.log('[StudySession] Cannot start session - missing required IDs');
      return;
    }

    // Prevent race conditions - only one session start at a time
    if (isStartingSessionRef.current) {
      console.log('[StudySession] Session start already in progress, skipping');
      return sessionId;
    }

    isStartingSessionRef.current = true;
    
    try {
      console.log('[StudySession] Starting study session', { courseId, moduleId, lessonId });
      
      // First, check if there's already an active session
      try {
        console.log('[StudySession] Checking for existing active session...');
        const activeSessionResponse = await api.get('/api/v1/sessions/active/single');
      
      console.log('[StudySession] Active session response:', {
        status: activeSessionResponse.status,
        data: activeSessionResponse.data,
        hasData: !!activeSessionResponse.data,
        hasId: !!(activeSessionResponse.data && activeSessionResponse.data.sessionId)
      });
      
      if (activeSessionResponse.data && activeSessionResponse.data.sessionId) {
        const existingSession = activeSessionResponse.data;
        
        console.log('[StudySession] Found existing session:', {
          sessionId: existingSession.sessionId,
          sessionCourse: existingSession.courseId,
          currentCourse: courseId,
          isCompatible: isSessionCompatible(existingSession, courseId, moduleId, lessonId)
        });
        
        // Check if existing session is compatible with current lesson
        if (isSessionCompatible(existingSession, courseId, moduleId, lessonId)) {
          console.log('[StudySession] Using compatible existing session:', existingSession.sessionId);
          setSessionId(existingSession.sessionId);
          setIsSessionActive(true);
          setError(null);
          setSessionWarning(false);
          lastHeartbeatRef.current = new Date();
          scheduleSessionWarning();
          return existingSession.sessionId;
        } else {
          // Session exists but for different course - end it first
          console.log('[StudySession] Found incompatible session, ending it first');
          try {
            await api.put(`/api/v1/sessions/${existingSession.sessionId}/end`);
            console.log('[StudySession] Ended incompatible session');
          } catch (endErr) {
            console.warn('[StudySession] Failed to end incompatible session:', endErr.message);
          }
        }
      } else {
        console.log('[StudySession] No active session found, will create new one');
      }
    } catch (activeSessionErr) {
      console.log('[StudySession] Error checking for active session:', {
        status: activeSessionErr.response?.status,
        message: activeSessionErr.message,
        responseData: activeSessionErr.response?.data
      });
      
      // If 404, no active session exists, continue to create new one
      // If other error, log but still try to create session
      if (activeSessionErr.response?.status !== 404) {
        console.warn('[StudySession] Unexpected error checking for active session:', activeSessionErr.message);
      }
    }

    // No active session found or incompatible session ended, create a new one
    try {
      console.log('[StudySession] Creating new session with:', { courseId, moduleId, lessonId });
      const response = await api.post('/api/v1/sessions/start', {
        courseId,
        moduleId, 
        lessonId
      });

      console.log('[StudySession] Session creation response:', {
        status: response.status,
        data: response.data,
        hasId: !!(response.data && response.data.sessionId)
      });

      if (response.data && response.data.sessionId) {
        console.log('[StudySession] Started new session successfully:', response.data.sessionId);
        setSessionId(response.data.sessionId);
        setIsSessionActive(true);
        setError(null);
        setSessionWarning(false);
        lastHeartbeatRef.current = new Date();
        scheduleSessionWarning();
        return response.data.sessionId;
      }
    } catch (createSessionErr) {
      console.log('[StudySession] Session creation failed:', {
        status: createSessionErr.response?.status,
        message: createSessionErr.message,
        responseData: createSessionErr.response?.data
      });
      
      // If 409 conflict, there might be an active session - try to get it again
      if (createSessionErr.response?.status === 409) {
        console.log('[StudySession] Session creation conflict detected, retrying to get active session');
        try {
          const retryActiveResponse = await api.get('/api/v1/sessions/active/single');
          console.log('[StudySession] Retry active session response:', {
            status: retryActiveResponse.status,
            data: retryActiveResponse.data,
            hasId: !!(retryActiveResponse.data && retryActiveResponse.data.sessionId)
          });
          
          if (retryActiveResponse.data && retryActiveResponse.data.sessionId) {
            console.log('[StudySession] Successfully found active session on retry:', retryActiveResponse.data.sessionId);
            setSessionId(retryActiveResponse.data.sessionId);
            setIsSessionActive(true);
            setError(null);
            setSessionWarning(false);
            lastHeartbeatRef.current = new Date();
            scheduleSessionWarning();
            return retryActiveResponse.data.sessionId;
          } else {
            console.error('[StudySession] Retry found no active session despite 409 error');
          }
        } catch (retryErr) {
          console.error('[StudySession] Failed to get active session on retry:', {
            status: retryErr.response?.status,
            message: retryErr.message,
            responseData: retryErr.response?.data
          });
        }
      }
      
      console.error('[StudySession] Final error creating session - giving up');
      setError('Failed to start study session');
      setIsSessionActive(false);
    }
    } finally {
      // Always release the race condition lock
      isStartingSessionRef.current = false;
    }
  };

  /**
   * Send heartbeat to update session location
   */
  const sendHeartbeat = async (currentSessionId, currentModuleId, currentLessonId) => {
    if (!currentSessionId || !currentModuleId || !currentLessonId) {
      return;
    }

    try {
      await api.post('/api/v1/sessions/heartbeat', {
        sessionId: currentSessionId,
        moduleId: currentModuleId,
        lessonId: currentLessonId
      });

      console.log('[StudySession] Heartbeat sent successfully');
      lastHeartbeatRef.current = new Date();
      setError(null);
      setSessionWarning(false);
      
      // Reset session warning timer
      scheduleSessionWarning();
    } catch (err) {
      console.error('[StudySession] Heartbeat failed:', err);
      
      // If session not found (404) or gone (410), session was ended/expired
      if (err.response?.status === 404 || err.response?.status === 410) {
        console.log('[StudySession] Session ended/expired, starting new session');
        handleSessionExpired();
      } else {
        setError('Heartbeat failed');
      }
    }
  };

  /**
   * End the current study session
   */
  const endSession = async () => {
    if (!sessionId) {
      return;
    }

    try {
      console.log('[StudySession] Ending session:', sessionId);
      await api.put(`/api/v1/sessions/${sessionId}/end`);
      
      cleanup();
      console.log('[StudySession] Session ended successfully');
    } catch (err) {
      console.error('[StudySession] Error ending session:', err);
      // Don't set error for end session failures, just log them
      cleanup(); // Still cleanup local state
    }
  };

  /**
   * Handle session expiration
   */
  const handleSessionExpired = () => {
    console.log('[StudySession] Session expired, cleaning up');
    cleanup();
    setError('Session expired. A new session will be started automatically.');
  };

  /**
   * Clean up session state and timers
   */
  const cleanup = () => {
    setSessionId(null);
    setIsSessionActive(false);
    setSessionWarning(false);
    clearWarningTimeout();
    stopHeartbeat();
  };

  /**
   * Schedule session warning
   */
  const scheduleSessionWarning = () => {
    clearWarningTimeout();
    
    const timeUntilWarning = SESSION_TIMEOUT - SESSION_WARNING_TIME;
    warningTimeoutRef.current = setTimeout(() => {
      if (sessionId && isSessionActive) {
        console.log('[StudySession] Session approaching timeout, showing warning');
        setSessionWarning(true);
        setError('Your study session will expire in 5 minutes due to inactivity. Continue studying to maintain your session.');
      }
    }, timeUntilWarning);
  };

  /**
   * Clear warning timeout
   */
  const clearWarningTimeout = () => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  };

  /**
   * Check if location has changed and needs heartbeat
   */
  const hasLocationChanged = (newModuleId, newLessonId) => {
    const lastLocation = lastLocationRef.current;
    if (!lastLocation) return true;
    
    return lastLocation.moduleId !== newModuleId || lastLocation.lessonId !== newLessonId;
  };

  /**
   * Setup heartbeat interval
   */
  const startHeartbeat = (currentSessionId) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (isActive && currentSessionId && moduleId && lessonId) {
        sendHeartbeat(currentSessionId, moduleId, lessonId);
        
        // Update last location
        lastLocationRef.current = { moduleId, lessonId };
      }
    }, HEARTBEAT_INTERVAL);

    console.log('[StudySession] Heartbeat interval started');
  };

  /**
   * Stop heartbeat interval
   */
  const stopHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[StudySession] Heartbeat interval stopped');
    }
  };

  // Effect to manage session lifecycle
  useEffect(() => {
    if (!isActive || !courseId || !moduleId || !lessonId) {
      return;
    }

    // Start session when component mounts or location changes
    const initializeSession = async () => {
      if (!sessionId || hasLocationChanged(moduleId, lessonId)) {
        const newSessionId = await startSession();
        if (newSessionId) {
          startHeartbeat(newSessionId);
          
          // Send immediate heartbeat for location update
          lastLocationRef.current = { moduleId, lessonId };
          await sendHeartbeat(newSessionId, moduleId, lessonId);
        }
      } else if (sessionId) {
        // Session exists, just ensure heartbeat is running
        startHeartbeat(sessionId);
      }
    };

    initializeSession();

    // Cleanup on unmount or when isActive becomes false
    return () => {
      stopHeartbeat();
      clearWarningTimeout();
      if (!isActive) {
        // Only end session if explicitly deactivated, not on unmount
        // This allows users to navigate between lessons without ending session
      }
    };
  }, [courseId, moduleId, lessonId, isActive, sessionId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      clearWarningTimeout();
    };
  }, []);

  // Handle page visibility changes - pause/resume heartbeat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[StudySession] Page hidden, stopping heartbeat');
        stopHeartbeat();
      } else if (isActive && sessionId) {
        console.log('[StudySession] Page visible, resuming heartbeat');
        startHeartbeat(sessionId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, sessionId]);

  // Handle page unload - end session
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable delivery on page unload
        navigator.sendBeacon('/api/v1/sessions/' + sessionId + '/end', '');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]);

  return {
    sessionId,
    isSessionActive,
    sessionWarning,
    error,
    startSession,
    endSession,
    // Manual controls (optional usage)
    sendHeartbeat: () => sendHeartbeat(sessionId, moduleId, lessonId)
  };
};

/**
 * Hook to get active study session info
 */
export const useActiveStudySession = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveSession = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/sessions/active/single');
      setActiveSession(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active session:', err);
      setActiveSession(null);
      if (err.response?.status !== 404) {
        setError('Failed to fetch active session');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  return {
    activeSession,
    loading,
    error,
    refetch: fetchActiveSession
  };
};
