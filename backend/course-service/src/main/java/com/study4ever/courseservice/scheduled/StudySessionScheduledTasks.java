package com.study4ever.courseservice.scheduled;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.study4ever.courseservice.config.StudySessionProperties;
import com.study4ever.courseservice.service.ActiveStudySessionService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled tasks for managing study sessions.
 * Handles regular cleanup of inactive and expired sessions.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class StudySessionScheduledTasks {

    private final ActiveStudySessionService sessionService;
    private final StudySessionProperties sessionProperties;
    
    /**
     * Log configuration on startup
     */
    @PostConstruct
    public void init() {
        log.info("Study session scheduled tasks initialized with properties: " +
                 "inactivity timeout: {} minutes, " +
                 "max duration: {} minutes, " +
                 "check interval: {} seconds",
                 sessionProperties.getMaxInactivityMinutes(),
                 sessionProperties.getMaxSessionDurationMinutes(),
                 sessionProperties.getSessionCheckIntervalSeconds());
    }
    
    /**
     * Periodically checks for and ends inactive or expired sessions
     */
    @Scheduled(fixedDelayString = "${study-session.session-check-interval-seconds:60}000")
    public void cleanupSessions() {
        log.debug("Running scheduled session cleanup task");
        
        int inactiveSessionsEnded = sessionService.endInactiveSessions(
            sessionProperties.getMaxInactivityMinutes()
        );
        
        int expiredSessionsEnded = sessionService.endExpiredSessions(
            sessionProperties.getMaxSessionDurationMinutes()
        );
        
        if (inactiveSessionsEnded > 0 || expiredSessionsEnded > 0) {
            log.info("Session cleanup complete. Ended {} inactive and {} expired sessions",
                    inactiveSessionsEnded, expiredSessionsEnded);
        }
    }
}
