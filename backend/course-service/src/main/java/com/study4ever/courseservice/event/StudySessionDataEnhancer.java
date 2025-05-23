package com.study4ever.courseservice.event;

import com.study4ever.courseservice.event.message.StudySessionHeartbeatEvent;
import com.study4ever.courseservice.model.ActiveStudySession;
import com.study4ever.courseservice.service.ActiveStudySessionPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Enhances active study session data based on heartbeat information.
 * Updates the course, module, and lesson information when heartbeats are received.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionDataEnhancer {

    private final ActiveStudySessionPersistenceService sessionService;

    /**
     * Updates an active session with information from a heartbeat event
     *
     * @param sessionId The session ID
     * @param event The heartbeat event with updated course/module/lesson information
     * @return true if the session was updated, false otherwise
     */
    public boolean updateSessionData(UUID sessionId, StudySessionHeartbeatEvent event) {
        return sessionService.findSessionById(sessionId)
                .map(session -> updateSessionDetails(session, event))
                .orElseGet(() -> {
                    log.warn("Received heartbeat for unknown session: {}", sessionId);
                    // Create a new session record if it doesn't exist
                    ActiveStudySession newSession = ActiveStudySession.builder()
                            .sessionId(sessionId)
                            .userId(event.getUserId())
                            .courseId(event.getCourseId())
                            .moduleId(event.getModuleId())
                            .lessonId(event.getLessonId())
                            .build();
                    sessionService.saveSession(newSession);
                    return true;
                });
    }

    private boolean updateSessionDetails(ActiveStudySession session, StudySessionHeartbeatEvent event) {
        // Update session details with the latest information from the heartbeat
        session.updateLocation(event.getModuleId(), event.getLessonId());
        
        // If the course ID in the session is unknown, update it
        if ("unknown".equals(session.getCourseId()) && event.getCourseId() != null) {
            session.setCourseId(event.getCourseId());
        }
        
        sessionService.saveSession(session);
        return true;
    }
}
