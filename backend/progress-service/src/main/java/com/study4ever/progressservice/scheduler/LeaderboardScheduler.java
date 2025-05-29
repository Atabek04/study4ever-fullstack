package com.study4ever.progressservice.scheduler;

import com.study4ever.progressservice.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class LeaderboardScheduler {

    private final LeaderboardService leaderboardService;

    /**
     * Calculate daily leaderboard every day at 01:00 AM
     * This runs after the StudyStatsScheduler to ensure stats are calculated first
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void calculateDailyLeaderboard() {
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            log.info("Starting scheduled daily leaderboard calculation for: {}", yesterday);
            
            leaderboardService.calculateDailyLeaderboard(yesterday);
            
            log.info("Completed scheduled daily leaderboard calculation for: {}", yesterday);
        } catch (Exception e) {
            log.error("Error during scheduled daily leaderboard calculation", e);
        }
    }

    /**
     * Calculate weekly leaderboard every Monday at 01:15 AM
     */
    @Scheduled(cron = "0 15 1 * * MON")
    public void calculateWeeklyLeaderboard() {
        try {
            LocalDate lastWeekStart = LocalDate.now().minusWeeks(1)
                .with(java.time.DayOfWeek.MONDAY);
            log.info("Starting scheduled weekly leaderboard calculation for week starting: {}", lastWeekStart);
            
            leaderboardService.calculateWeeklyLeaderboard(lastWeekStart);
            
            log.info("Completed scheduled weekly leaderboard calculation for week starting: {}", lastWeekStart);
        } catch (Exception e) {
            log.error("Error during scheduled weekly leaderboard calculation", e);
        }
    }

    /**
     * Calculate monthly leaderboard on the 1st day of each month at 01:30 AM
     */
    @Scheduled(cron = "0 30 1 1 * ?")
    public void calculateMonthlyLeaderboard() {
        try {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            int year = lastMonth.getYear();
            int month = lastMonth.getMonthValue();
            
            log.info("Starting scheduled monthly leaderboard calculation for {}/{}", year, month);
            
            leaderboardService.calculateMonthlyLeaderboard(year, month);
            
            log.info("Completed scheduled monthly leaderboard calculation for {}/{}", year, month);
        } catch (Exception e) {
            log.error("Error during scheduled monthly leaderboard calculation", e);
        }
    }

    /**
     * Calculate yearly leaderboard on January 1st at 01:45 AM
     */
    @Scheduled(cron = "0 45 1 1 1 ?")
    public void calculateYearlyLeaderboard() {
        try {
            int lastYear = LocalDate.now().getYear() - 1;
            log.info("Starting scheduled yearly leaderboard calculation for year: {}", lastYear);
            
            leaderboardService.calculateYearlyLeaderboard(lastYear);
            
            log.info("Completed scheduled yearly leaderboard calculation for year: {}", lastYear);
        } catch (Exception e) {
            log.error("Error during scheduled yearly leaderboard calculation", e);
        }
    }

    /**
     * Calculate current week leaderboard every Sunday at 23:30 for real-time updates
     */
    @Scheduled(cron = "0 30 23 * * SUN")
    public void calculateCurrentWeekLeaderboard() {
        try {
            LocalDate currentWeekStart = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY);
            log.info("Starting current week leaderboard calculation for week starting: {}", currentWeekStart);
            
            leaderboardService.calculateWeeklyLeaderboard(currentWeekStart);
            
            log.info("Completed current week leaderboard calculation for week starting: {}", currentWeekStart);
        } catch (Exception e) {
            log.error("Error during current week leaderboard calculation", e);
        }
    }

    /**
     * Calculate current month leaderboard on the last day of each month at 23:45 for real-time updates
     */
    @Scheduled(cron = "0 45 23 L * ?")
    public void calculateCurrentMonthLeaderboard() {
        try {
            LocalDate currentMonth = LocalDate.now();
            int year = currentMonth.getYear();
            int month = currentMonth.getMonthValue();
            
            log.info("Starting current month leaderboard calculation for {}/{}", year, month);
            
            leaderboardService.calculateMonthlyLeaderboard(year, month);
            
            log.info("Completed current month leaderboard calculation for {}/{}", year, month);
        } catch (Exception e) {
            log.error("Error during current month leaderboard calculation", e);
        }
    }
}
