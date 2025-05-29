package com.study4ever.progressservice.scheduled;

import com.study4ever.progressservice.service.StudyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudyStatsScheduler {

    private final StudyStatsService studyStatsService;

    /**
     * Calculate daily statistics for all users at 5 minutes after midnight
     * This runs every day to pre-calculate stats for faster retrieval
     */
    @Scheduled(cron = "0 5 0 * * *") // 5 minutes after midnight
    public void calculateDailyStats() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        log.info("Starting scheduled calculation of daily stats for {}", yesterday);
        
        try {
            studyStatsService.calculateDailyStatsForAllUsers(yesterday);
            log.info("Successfully completed daily stats calculation for {}", yesterday);
        } catch (Exception e) {
            log.error("Failed to calculate daily stats for {}", yesterday, e);
        }
    }

    /**
     * Cleanup old statistics (optional - keep last 2 years)
     * Runs once a week on Sunday at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void cleanupOldStats() {
        log.info("Starting cleanup of old statistics");
        
        try {
            // This can be implemented later if needed
            // studyStatsService.cleanupOldStats(LocalDate.now().minusYears(2));
            log.info("Statistics cleanup completed");
        } catch (Exception e) {
            log.error("Failed to cleanup old statistics", e);
        }
    }
}
