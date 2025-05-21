package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.model.ActiveStudySession;
import com.study4ever.courseservice.service.ActiveStudySessionInternalService;
import com.study4ever.courseservice.service.ActiveStudySessionPersistenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActiveStudySessionInternalServiceImpl implements ActiveStudySessionInternalService {
    private final ActiveStudySessionPersistenceService persistenceService;

    @Override
    @Transactional
    public ActiveStudySession createSession(String userId, String courseId, String moduleId, String lessonId) {
        Instant now = Instant.now();
        ActiveStudySession session = ActiveStudySession.builder()
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .lessonId(lessonId)
                .startTime(now)
                .lastActivityTime(now)
                .build();
        return persistenceService.saveSession(session);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ActiveStudySession> findSessionById(UUID sessionId) {
        return persistenceService.findSessionById(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActiveStudySession> findSessionsByUser(String userId) {
        return persistenceService.findSessionsByUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveSession(String userId) {
        return persistenceService.hasActiveSession(userId);
    }

    @Override
    @Transactional
    public Optional<ActiveStudySession> updateSessionLocation(UUID sessionId, String moduleId, String lessonId) {
        return persistenceService.updateSessionLocation(sessionId, moduleId, lessonId);
    }

    @Override
    @Transactional
    public boolean recordActivity(UUID sessionId) {
        return persistenceService.recordActivity(sessionId);
    }

    @Override
    @Transactional
    public boolean endSession(UUID sessionId) {
        return persistenceService.endSession(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActiveStudySession> getAllActiveSessions() {
        return persistenceService.getAllActiveSessions();
    }

    @Override
    @Transactional
    public int endInactiveSessions(int inactivityMinutes) {
        return persistenceService.endInactiveSessions(inactivityMinutes);
    }

    @Override
    @Transactional
    public int endExpiredSessions(int maxSessionDurationMinutes) {
        return persistenceService.endExpiredSessions(maxSessionDurationMinutes);
    }
}
