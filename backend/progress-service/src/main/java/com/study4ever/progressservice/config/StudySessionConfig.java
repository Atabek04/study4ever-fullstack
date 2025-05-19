package com.study4ever.progressservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "study-session")
@Data
public class StudySessionConfig {
    
    /**
     * Maximum inactivity time in minutes before auto-closing a session
     */
    private int maxInactivityMinutes = 15;
    
    /**
     * Maximum total session duration in minutes
     */
    private int maxSessionDurationMinutes = 240; // 4 hours by default
    
    /**
     * Heartbeat check interval in seconds
     */
    private int heartbeatCheckIntervalSeconds = 60;
}
