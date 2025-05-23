package com.study4ever.courseservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.study4ever.courseservice.config.StudySessionProperties;
import org.springframework.stereotype.Service;

import com.study4ever.courseservice.event.StudySessionEventPublisher;
import com.study4ever.courseservice.event.message.StudySessionStartedEvent;
import com.study4ever.courseservice.event.message.StudySessionHeartbeatEvent;
import com.study4ever.courseservice.exception.SessionNotFoundException;
import com.study4ever.courseservice.exception.SessionConflictException;
import com.study4ever.courseservice.model.ActiveStudySession;
import com.study4ever.courseservice.service.ActiveStudySessionService;
import com.study4ever.courseservice.service.ActiveStudySessionInternalService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActiveStudySessionServiceImpl implements ActiveStudySessionService {

    private final ActiveStudySessionInternalService internalService;
    private final StudySessionEventPublisher eventPublisher;
    private final StudySessionProperties studySessionProperties;

    public void createSessionWithEvent(String userId, String courseId, String moduleId, String lessonId, LocalDateTime startTime) {
        if (!studySessionProperties.isAllowMultipleActiveSessions() && internalService.hasActiveSession(userId)) {
            throw new SessionConflictException();
        }
        eventPublisher.publishStudySessionStarted(new StudySessionStartedEvent(userId, courseId, moduleId, lessonId, startTime));
    }
    
    @Override
    public List<ActiveStudySession> findSessionsByUser(String userId) {
        return internalService.findSessionsByUser(userId);
    }
    
    @Override
    public boolean hasActiveSession(String userId) {
        return internalService.hasActiveSession(userId);
    }

    public void updateSessionLocationWithEvent(UUID sessionId, String moduleId, String lessonId, java.time.LocalDateTime timestamp) {
        var updated = internalService.updateSessionLocation(sessionId, moduleId, lessonId);
        if (updated.isEmpty()) {
            throw new SessionNotFoundException();
        }
        ActiveStudySession session = updated.get();
        eventPublisher.publishStudySessionHeartbeat(
            StudySessionHeartbeatEvent.builder()
                .userId(session.getUserId())
                .sessionId(session.getSessionId())
                .courseId(session.getCourseId())
                .moduleId(session.getModuleId())
                .lessonId(session.getLessonId())
                .timestamp(timestamp)
                .build()
        );
    }

    @Override
    public int endInactiveSessions(int inactivityMinutes) {
        return internalService.endInactiveSessions(inactivityMinutes);
    }
    
    @Override
    public int endExpiredSessions(int maxSessionDurationMinutes) {
        return internalService.endExpiredSessions(maxSessionDurationMinutes);
    }
}
