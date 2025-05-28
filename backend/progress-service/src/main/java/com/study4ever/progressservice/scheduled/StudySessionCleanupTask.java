package com.study4ever.progressservice.scheduled;

import com.study4ever.progressservice.service.StudySessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "study.session.cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class StudySessionCleanupTask {

    private final StudySessionService studySessionService;

    /**
     * Runs every 5 minutes to clean up expired study sessions
     */
    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    public void cleanupExpiredSessions() {
        log.debug("Running expired study session cleanup task");
        try {
            studySessionService.cleanupExpiredSessions();
        } catch (Exception e) {
            log.error("Error during study session cleanup: {}", e.getMessage(), e);
        }
    }
}
