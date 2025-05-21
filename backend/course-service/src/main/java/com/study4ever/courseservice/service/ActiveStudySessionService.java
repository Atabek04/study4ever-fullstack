package com.study4ever.courseservice.service;

import com.study4ever.courseservice.model.ActiveStudySession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service interface for managing active study sessions.
 */
public interface ActiveStudySessionService {

    void createSessionWithEvent(String userId, String courseId, String moduleId, String lessonId, LocalDateTime startTime);

    List<ActiveStudySession> findSessionsByUser(String userId);

    boolean hasActiveSession(String userId);

    void updateSessionLocationWithEvent(UUID sessionId, String moduleId, String lessonId, java.time.LocalDateTime timestamp);

    int endInactiveSessions(int inactivityMinutes);

    int endExpiredSessions(int maxSessionDurationMinutes);
}
