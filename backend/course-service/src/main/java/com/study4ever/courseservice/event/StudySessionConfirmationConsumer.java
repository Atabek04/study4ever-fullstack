package com.study4ever.courseservice.event;

import com.study4ever.courseservice.event.message.StudySessionConfirmationEvent;
import com.study4ever.courseservice.model.ActiveStudySession;
import com.study4ever.courseservice.service.ActiveStudySessionPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Consumes study session confirmation events from the progress-service
 * to maintain the state of active sessions in the course-service database.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionConfirmationConsumer {

    private final ActiveStudySessionPersistenceService sessionService;

    /**
     * Handles confirmation events for study sessions from the progress-service.
     * Creates, updates, or removes active session records based on the event.
     */
    @RabbitListener(queues = "${rabbitmq.queues.study-session-confirmation}")
    public void handleStudySessionConfirmation(StudySessionConfirmationEvent event) {
        String userId = event.getUserId();
        UUID sessionId = event.getSessionId();
        String action = event.getAction();
        boolean success = event.isSuccess();

        if (userId == null) {
            log.warn("Received session confirmation event with null userId: {}", event);
            return;
        }

        log.info("Received study session confirmation: userId={}, sessionId={}, action={}, success={}", 
                userId, sessionId, action, success);

        // Process based on the action and success status
        switch (action) {
            case "started":
                handleSessionStarted(event);
                break;
            case "ended":
                handleSessionEnded(event);
                break;
            case "heartbeat":
                handleSessionHeartbeat(event);
                break;
            default:
                log.warn("Unrecognized session action: {}", action);
        }
    }

    private void handleSessionStarted(StudySessionConfirmationEvent event) {
        if (event.isSuccess() && event.getSessionId() != null) {
            // Create a new active session record in our database
            ActiveStudySession session = ActiveStudySession.builder()
                    .sessionId(event.getSessionId())
                    .userId(event.getUserId())
                    .courseId("unknown") // These values will need to be updated with heartbeats
                    .moduleId("unknown")
                    .lessonId("unknown")
                    .startTime(Instant.now())
                    .lastActivityTime(Instant.now())
                    .build();
            
            sessionService.saveSession(session);
            log.info("Created active session record for session: {}", event.getSessionId());
        } else {
            log.warn("Failed to start session for user {}: {}", 
                    event.getUserId(), event.getMessage());
        }
    }

    private void handleSessionEnded(StudySessionConfirmationEvent event) {
        if (event.getSessionId() != null) {
            boolean removed = sessionService.endSession(event.getSessionId());
            if (removed) {
                log.info("Removed active session record for session: {}", event.getSessionId());
            } else {
                log.warn("Could not find active session to remove with ID: {}", event.getSessionId());
            }
        }
    }

    private void handleSessionHeartbeat(StudySessionConfirmationEvent event) {
        if (event.isSuccess() && event.getSessionId() != null) {
            // First update activity timestamp
            boolean updated = sessionService.recordActivity(event.getSessionId());
            
            if (updated) {
                log.debug("Updated activity timestamp for session: {}", event.getSessionId());
                
                // This is where we would update module/lesson information,
                // but we don't have that data in the confirmation event
                // We'd need additional data from a heartbeat consumer
            } else {
                log.warn("Could not update activity for unknown session: {}", event.getSessionId());
            }
        }
    }
}
