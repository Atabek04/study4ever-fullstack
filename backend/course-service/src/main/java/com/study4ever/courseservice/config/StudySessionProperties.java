package com.study4ever.courseservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuration properties for study session management.
 * Contains settings for timeouts, durations and session management behavior.
 */
@Configuration
@ConfigurationProperties(prefix = "study-session")
@Getter
@Setter
public class StudySessionProperties {
    
    /**
     * Interval for sending heartbeat events (in seconds)
     */
    private int heartbeatIntervalSeconds = 30;
    
    /**
     * Maximum inactivity time in minutes before auto-closing a session
     */
    private int maxInactivityMinutes = 15;
    
    /**
     * Maximum total session duration in minutes
     */
    private int maxSessionDurationMinutes = 240; // 4 hours by default
    
    /**
     * Interval for checking inactive sessions (in seconds)
     */
    private int sessionCheckIntervalSeconds = 60;
    
    /**
     * Whether to allow multiple active sessions per user
     */
    private boolean allowMultipleActiveSessions = false;
}
