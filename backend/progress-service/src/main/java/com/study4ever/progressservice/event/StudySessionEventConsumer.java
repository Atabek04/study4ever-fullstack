package com.study4ever.progressservice.event;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.study4ever.progressservice.config.StudySessionConfig;
import com.study4ever.progressservice.dto.ActiveSessionData;
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

    private final Map<String, ActiveSessionData> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    private final StudySessionService studySessionService;
    private final LessonProgressService lessonProgressService;
    private final StudySessionConfig sessionConfig;
    
    
    @RabbitListener(queues = "${rabbitmq.queues.study-session-started}")
    @Transactional
    public void handleStudySessionStarted(StudySessionStartedEvent event) {
        log.info("Received study session started event: userId={}, courseId={}", 
                event.getUserId(), event.getCourseId());
        
        StartStudySessionRequest request = new StartStudySessionRequest();
        request.setCourseId(event.getCourseId());
        request.setModuleId(event.getModuleId());
        request.setLessonId(event.getLessonId());
        
        StudySessionDto sessionDto = studySessionService.startStudySession(event.getUserId(), request);
        
        ActiveSessionData sessionData = new ActiveSessionData(
            event.getModuleId(),
            event.getLessonId(),
            event.getTimestamp().atZone(ZoneId.systemDefault()).toInstant()
        );
        
        String sessionId = sessionDto.getSessionId().toString();
        activeSessions.put(sessionId, sessionData);
        sessionUserMap.put(sessionId, event.getUserId());
        
        lessonProgressService.updateLastAccessed(
            event.getUserId(), 
            event.getCourseId(), 
            event.getModuleId(), 
            event.getLessonId()
        );
        
        log.info("Started tracking study session: {}", sessionDto.getSessionId());
    }
    
    @RabbitListener(queues = "${rabbitmq.queues.study-session-ended}")
    @Transactional
    public void handleStudySessionEnded(StudySessionEndedEvent event) {
        log.info("Received study session ended event: userId={}, sessionId={}", 
                event.getUserId(), event.getSessionId());
        
        String sessionIdStr = event.getSessionId().toString();
        ActiveSessionData sessionData = activeSessions.remove(sessionIdStr);
        sessionUserMap.remove(sessionIdStr);
        
        if (sessionData != null) {
            Duration duration = Duration.between(sessionData.getStartTime(), Instant.now());
            
            studySessionService.endStudySession(event.getUserId(), event.getSessionId());
            
            log.info("Finalized study session: {}, duration: {} minutes", 
                    event.getSessionId(), duration.toMinutes());
        } else {
            log.warn("Could not find active session with ID: {}", event.getSessionId());
        }
    }
    
    @RabbitListener(queues = "${rabbitmq.queues.study-session-heartbeat}")
    public void handleStudySessionHeartbeat(StudySessionHeartbeatEvent event) {
        log.debug("Received study session heartbeat event: userId={}, sessionId={}", 
                event.getUserId(), event.getSessionId());
        
        String sessionIdStr = event.getSessionId().toString();
        ActiveSessionData sessionData = activeSessions.get(sessionIdStr);
        
        if (sessionData != null) {
            Instant now = Instant.now();
            sessionData.setLastActivityTime(now);
            
            if (!sessionData.getModuleId().equals(event.getModuleId()) ||
                !sessionData.getLessonId().equals(event.getLessonId())) {
                
                log.info("User {} moved to new module/lesson in session {}", 
                        event.getUserId(), event.getSessionId());
                
                sessionData.setModuleId(event.getModuleId());
                sessionData.setLessonId(event.getLessonId());
                
                lessonProgressService.updateLastAccessed(
                    event.getUserId(),
                    event.getCourseId(),
                    event.getModuleId(),
                    event.getLessonId()
                );
            }
        } else {
            log.warn("Received heartbeat for unknown session: {}", event.getSessionId());
        }
    }
    
    /**
     * Scheduled task to check for inactive sessions and sessions exceeding maximum duration
     */
    @Scheduled(fixedDelayString = "${study-session.heartbeat-check-interval-seconds:60}000")
    @Transactional
    public void checkInactiveSessions() {
        Instant now = Instant.now();
        
        activeSessions.forEach((sessionId, sessionData) -> {
            String userId = sessionUserMap.get(sessionId);
            if (userId == null) {
                log.warn("Session {} has no associated user, removing from tracked sessions", sessionId);
                activeSessions.remove(sessionId);
                return;
            }
            
            // Check for inactivity timeout
            Duration inactiveDuration = Duration.between(sessionData.getLastActivityTime(), now);
            if (inactiveDuration.toMinutes() >= sessionConfig.getMaxInactivityMinutes()) {
                log.info("Auto-ending inactive session {} for user {}. Inactive for {} minutes", 
                        sessionId, userId, inactiveDuration.toMinutes());
                
                try {
                    studySessionService.endStudySession(userId, UUID.fromString(sessionId));
                    activeSessions.remove(sessionId);
                    sessionUserMap.remove(sessionId);
                } catch (Exception e) {
                    log.error("Error ending inactive session {}: {}", sessionId, e.getMessage(), e);
                }
                return;
            }
            
            // Check for max session duration
            Duration totalDuration = Duration.between(sessionData.getStartTime(), now);
            if (totalDuration.toMinutes() >= sessionConfig.getMaxSessionDurationMinutes()) {
                log.info("Auto-ending session {} for user {} due to maximum duration exceeded. Session lasted {} minutes", 
                        sessionId, userId, totalDuration.toMinutes());
                
                try {
                    studySessionService.endStudySession(userId, UUID.fromString(sessionId));
                    activeSessions.remove(sessionId);
                    sessionUserMap.remove(sessionId);
                } catch (Exception e) {
                    log.error("Error ending session at maximum duration {}: {}", sessionId, e.getMessage(), e);
                }
            }
        });
    }
    
    /**
     * Attempt to recover active sessions from database on application startup
     */
    @Transactional
    public void recoverActiveSessions() {
        log.info("Recovering active sessions from database");
        
        studySessionService.getUserStudySessions(null).stream()
                .filter(dto -> Boolean.TRUE.equals(dto.getActive()))
                .forEach(session -> {
                    log.info("Recovering session: {}", session.getSessionId());
                    
                    // If session has been active for more than max duration, end it
                    Instant startTime = session.getStartTime().atZone(ZoneId.systemDefault()).toInstant();
                    Instant now = Instant.now();
                    Duration totalDuration = Duration.between(startTime, now);
                    
                    if (totalDuration.toMinutes() >= sessionConfig.getMaxSessionDurationMinutes()) {
                        log.info("Ending recovered session {} due to maximum duration. Session lasted {} minutes", 
                                session.getSessionId(), totalDuration.toMinutes());
                        
                        try {
                            studySessionService.endStudySession(session.getUserId(), session.getSessionId());
                        } catch (Exception e) {
                            log.error("Error ending recovered session {}: {}", session.getSessionId(), e.getMessage(), e);
                        }
                    } else {
                        // Otherwise track it
                        ActiveSessionData sessionData = new ActiveSessionData(
                                session.getModuleId(),
                                session.getLessonId(),
                                startTime
                        );
                        sessionData.setLastActivityTime(now.minus(Duration.ofMinutes(10))); // Assume 10 min of inactivity
                        
                        activeSessions.put(session.getSessionId().toString(), sessionData);
                        sessionUserMap.put(session.getSessionId().toString(), session.getUserId());
                    }
                });
    }
}
