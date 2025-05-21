package com.study4ever.progressservice.event;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.study4ever.progressservice.event.message.StudySessionEndedEvent;
import com.study4ever.progressservice.event.message.StudySessionHeartbeatEvent;
import com.study4ever.progressservice.event.message.StudySessionStartedEvent;
import com.study4ever.progressservice.event.message.StudySessionConfirmationEvent;
import com.study4ever.progressservice.event.message.SessionReconciliationRequest;
import com.study4ever.progressservice.event.message.SessionReconciliationResponse;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.study4ever.progressservice.config.StudySessionConfig;
import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;
import com.study4ever.progressservice.service.LessonProgressService;
import com.study4ever.progressservice.service.StudySessionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionEventConsumer {

    private final StudySessionService studySessionService;
    private final LessonProgressService lessonProgressService;
    private final StudySessionConfig sessionConfig;
    private final StudySessionConfirmationPublisher confirmationPublisher;
    private final SessionReconciliationHandler reconciliationHandler;

    @RabbitListener(queues = "study.session.started.queue")
    @Transactional
    public void handleStudySessionStarted(StudySessionStartedEvent event) {
        log.info("Received study session started event: userId={}, courseId={}", event.getUserId(), event.getCourseId());
        StartStudySessionRequest request = new StartStudySessionRequest();
        request.setCourseId(event.getCourseId());
        request.setModuleId(event.getModuleId());
        request.setLessonId(event.getLessonId());
        try {
            StudySessionDto sessionDto = studySessionService.startStudySession(event.getUserId(), request);
            lessonProgressService.updateLastAccessed(
                event.getUserId(), event.getCourseId(), event.getModuleId(), event.getLessonId()
            );
            log.info("Started tracking study session: {}", sessionDto.getSessionId());
            confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                sessionDto.getSessionId(), event.getUserId(), "started", true, "Session started successfully"
            ));
        } catch (Exception e) {
            confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                null, event.getUserId(), "started", false, e.getMessage()
            ));
            throw e;
        }
    }

    @RabbitListener(queues = "study.session.ended.queue")
    @Transactional
    public void handleStudySessionEnded(StudySessionEndedEvent event) {
        log.info("Received study session ended event: userId={}, sessionId={}", event.getUserId(), event.getSessionId());
        try {
            StudySessionDto sessionDto = studySessionService.getStudySession(event.getUserId(), event.getSessionId());
            if (Boolean.TRUE.equals(sessionDto.getActive())) {
                studySessionService.endStudySession(event.getUserId(), event.getSessionId());
                log.info("Finalized study session: {}", event.getSessionId());
                confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                    event.getSessionId(), event.getUserId(), "ended", true, "Session ended successfully"
                ));
            } else {
                log.warn("Could not find active session with ID: {} (already ended)", event.getSessionId());
                confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                    event.getSessionId(), event.getUserId(), "ended", false, "Active session not found"
                ));
            }
        } catch (Exception e) {
            confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                event.getSessionId(), event.getUserId(), "ended", false, e.getMessage()
            ));
            throw e;
        }
    }

    @RabbitListener(queues = "study.session.heartbeat.queue")
    @Transactional
    public void handleStudySessionHeartbeat(StudySessionHeartbeatEvent event) {
        log.debug("Received study session heartbeat event: userId={}, sessionId={}", event.getUserId(), event.getSessionId());
        try {
            StudySessionDto sessionDto = studySessionService.getStudySession(event.getUserId(), event.getSessionId());
            if (Boolean.TRUE.equals(sessionDto.getActive())) {
                // If module/lesson changed, update last accessed
                if (!sessionDto.getModuleId().equals(event.getModuleId()) ||
                    !sessionDto.getLessonId().equals(event.getLessonId())) {
                    log.info("User {} moved to new module/lesson in session {}", event.getUserId(), event.getSessionId());
                    // Optionally update session entity if needed (not shown here)
                    lessonProgressService.updateLastAccessed(
                        event.getUserId(), event.getCourseId(), event.getModuleId(), event.getLessonId()
                    );
                }
                confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                    event.getSessionId(), event.getUserId(), "heartbeat", true, "Heartbeat processed"
                ));
            } else {
                log.warn("Received heartbeat for unknown or inactive session: {}", event.getSessionId());
                confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                    event.getSessionId(), event.getUserId(), "heartbeat", false, "Unknown or inactive session"
                ));
            }
        } catch (Exception e) {
            confirmationPublisher.publishConfirmation(new StudySessionConfirmationEvent(
                event.getSessionId(), event.getUserId(), "heartbeat", false, e.getMessage()
            ));
            throw e;
        }
    }

    /**
     * Scheduled task to check for inactive sessions and sessions exceeding maximum duration
     */
    @Scheduled(fixedDelayString = "${study-session.heartbeat-check-interval-seconds:60}000") // 60 seconds
    @Transactional
    public void checkInactiveSessions() {
        var now = LocalDateTime.now();
        var activeSessions = studySessionService.getActiveUserStudySessions(null); // null = all users
        for (StudySessionDto session : activeSessions) {
            String userId = session.getUserId();
            if (userId == null) {
                log.warn("Session {} has no associated user, skipping", session.getSessionId());
                continue;
            }
            Duration inactiveDuration = Duration.between(
                session.getEndTime() != null ? session.getEndTime() : session.getStartTime(), now);
            if (inactiveDuration.toMinutes() >= sessionConfig.getMaxInactivityMinutes()) {
                log.info("Auto-ending inactive session {} for user {}. Inactive for {} minutes", 
                        session.getSessionId(), userId, inactiveDuration.toMinutes());
                try {
                    studySessionService.endStudySession(userId, session.getSessionId());
                } catch (Exception e) {
                    log.error("Error ending inactive session {}: {}", session.getSessionId(), e.getMessage(), e);
                }
                continue;
            }
            Duration totalDuration = Duration.between(session.getStartTime(), now);
            if (totalDuration.toMinutes() >= sessionConfig.getMaxSessionDurationMinutes()) {
                log.info("Auto-ending session {} for user {} due to maximum duration exceeded. Session lasted {} minutes", 
                        session.getSessionId(), userId, totalDuration.toMinutes());
                try {
                    studySessionService.endStudySession(userId, session.getSessionId());
                } catch (Exception e) {
                    log.error("Error ending session at maximum duration {}: {}", session.getSessionId(), e.getMessage(), e);
                }
            }
        }
    }

    /**
     * Attempt to recover active sessions from database on application startup
     */
    @Transactional
    public void recoverActiveSessions() {
        log.info("Recovering active sessions from database (no in-memory tracking, using persistent storage)");
        // No-op: all session state is now in the database
    }

    @RabbitListener(queues = "${rabbitmq.queues.session-reconciliation-request}")
    public void handleSessionReconciliationRequest(SessionReconciliationRequest request) {
        String userId = request.getUserId();
        List<UUID> remoteSessionIds = request.getSessionIds();
        List<StudySessionDto> localSessions = userId == null ? studySessionService.getActiveUserStudySessions(null) : studySessionService.getActiveUserStudySessions(userId);
        Set<UUID> localSessionIds = localSessions.stream().map(StudySessionDto::getSessionId).collect(java.util.stream.Collectors.toSet());
        reconciliationHandler.handleReconciliationRequest(userId, remoteSessionIds, localSessionIds);
    }

    @RabbitListener(queues = "${rabbitmq.queues.session-reconciliation-response}")
    public void handleSessionReconciliationResponse(SessionReconciliationResponse response) {
        reconciliationHandler.handleReconciliationResponse(response);
    }
}
