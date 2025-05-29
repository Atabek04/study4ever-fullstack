package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.LeaderboardEntryDto;
import com.study4ever.progressservice.dto.LeaderboardResponseDto;
import com.study4ever.progressservice.model.PeriodType;

import java.time.LocalDate;

public interface LeaderboardService {

    /**
     * Get daily leaderboard for a specific date
     */
    LeaderboardResponseDto getDailyLeaderboard(LocalDate date, int limit);

    /**
     * Get weekly leaderboard for a specific week start date
     */
    LeaderboardResponseDto getWeeklyLeaderboard(LocalDate startDate, int limit);

    /**
     * Get monthly leaderboard for a specific month
     */
    LeaderboardResponseDto getMonthlyLeaderboard(int year, int month, int limit);

    /**
     * Get yearly leaderboard for a specific year
     */
    LeaderboardResponseDto getYearlyLeaderboard(int year, int limit);

    /**
     * Get current user's rank for a specific period
     */
    LeaderboardEntryDto getUserRankForPeriod(String userId, PeriodType periodType, LocalDate startDate, LocalDate endDate);

    /**
     * Calculate and store daily leaderboard rankings
     * Called by scheduled task
     */
    void calculateDailyLeaderboard(LocalDate date);

    /**
     * Calculate and store weekly leaderboard rankings
     * Called by scheduled task
     */
    void calculateWeeklyLeaderboard(LocalDate weekStart);

    /**
     * Calculate and store monthly leaderboard rankings
     * Called by scheduled task
     */
    void calculateMonthlyLeaderboard(int year, int month);

    /**
     * Calculate and store yearly leaderboard rankings
     * Called by scheduled task
     */
    void calculateYearlyLeaderboard(int year);

    /**
     * Recalculate leaderboard for a specific period
     * Useful for data corrections
     */
    void recalculateLeaderboard(PeriodType periodType, LocalDate startDate, LocalDate endDate);
}
