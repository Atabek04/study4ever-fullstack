package com.study4ever.courseservice.event;

import com.study4ever.courseservice.event.message.StudySessionHeartbeatEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Consumes study session heartbeat events to update session information
 * Primarily used to update module and lesson information for active sessions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionHeartbeatConsumer {

    private final StudySessionDataEnhancer dataEnhancer;

    /**
     * Handles heartbeat events to update location information
     */
    @RabbitListener(queues = "${rabbitmq.queues.study-session-heartbeat}")
    public void handleStudySessionHeartbeat(StudySessionHeartbeatEvent event) {
        String userId = event.getUserId();
        UUID sessionId = event.getSessionId();

        if (userId == null || sessionId == null) {
            log.warn("Received invalid heartbeat event: {}", event);
            return;
        }

        log.debug("Received study session heartbeat: userId={}, sessionId={}, moduleId={}, lessonId={}", 
                userId, sessionId, event.getModuleId(), event.getLessonId());

        // Update the session's data with location information from the heartbeat
        if (!dataEnhancer.updateSessionData(sessionId, event)) {
            log.warn("Failed to update session data for heartbeat: sessionId={}", sessionId);
        }
    }
}
