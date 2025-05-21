package com.study4ever.courseservice.service;

import com.study4ever.courseservice.model.ActiveStudySession;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActiveStudySessionPersistenceService {

    ActiveStudySession saveSession(ActiveStudySession session);

    Optional<ActiveStudySession> findSessionById(UUID sessionId);

    List<ActiveStudySession> findSessionsByUser(String userId);

    boolean hasActiveSession(String userId);

    Optional<ActiveStudySession> updateSessionLocation(UUID sessionId, String moduleId, String lessonId);

    boolean recordActivity(UUID sessionId);

    boolean endSession(UUID sessionId);

    List<ActiveStudySession> getAllActiveSessions();

    int endInactiveSessions(int inactivityMinutes);

    int endExpiredSessions(int maxSessionDurationMinutes);
}
