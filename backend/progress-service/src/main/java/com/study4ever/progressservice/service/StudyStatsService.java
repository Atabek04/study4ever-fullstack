package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.DailyStatsDto;
import com.study4ever.progressservice.dto.WeeklyStatsDto;
import com.study4ever.progressservice.dto.MonthlyStatsDto;
import com.study4ever.progressservice.dto.YearlyStatsDto;

import java.time.LocalDate;
import java.util.List;

public interface StudyStatsService {

    /**
     * Get daily statistics for a specific user and date
     */
    DailyStatsDto getDailyStats(String userId, LocalDate date);

    /**
     * Get weekly statistics for a specific user and week start date
     */
    WeeklyStatsDto getWeeklyStats(String userId, LocalDate startDate);

    /**
     * Get monthly statistics for a specific user and year
     */
    YearlyStatsDto getMonthlyStats(String userId, int year);

    /**
     * Get daily statistics for a range of days
     */
    List<DailyStatsDto> getDailyStatsRange(String userId, int days);

    /**
     * Get weekly statistics for a range of weeks
     */
    List<WeeklyStatsDto> getWeeklyStatsRange(String userId, int weeks);

    /**
     * Get monthly statistics for a range of months
     */
    List<MonthlyStatsDto> getMonthlyStatsRange(String userId, int months);

    /**
     * Get yearly statistics for a range of years
     */
    List<YearlyStatsDto> getYearlyStatsRange(String userId, int years);

    /**
     * Calculate and store daily statistics for a specific date
     * This method is called by the scheduled task
     */
    void calculateAndStoreDailyStats(String userId, LocalDate date);

    /**
     * Calculate and store daily statistics for all users for a specific date
     * This method is called by the scheduled task
     */
    void calculateDailyStatsForAllUsers(LocalDate date);

    /**
     * Recalculate statistics for a specific user and date range
     * Useful for data corrections or manual recalculation
     */
    void recalculateStats(String userId, LocalDate startDate, LocalDate endDate);
}
