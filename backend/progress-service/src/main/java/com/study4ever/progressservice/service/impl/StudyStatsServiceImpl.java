package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.DailyStatsDto;
import com.study4ever.progressservice.dto.WeeklyStatsDto;
import com.study4ever.progressservice.dto.MonthlyStatsDto;
import com.study4ever.progressservice.dto.YearlyStatsDto;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.model.StudySessionStats;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.repository.StudySessionStatsRepository;
import com.study4ever.progressservice.service.StudyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyStatsServiceImpl implements StudyStatsService {

    private final StudySessionRepository studySessionRepository;
    private final StudySessionStatsRepository studySessionStatsRepository;

    @Override
    @Transactional(readOnly = true)
    public DailyStatsDto getDailyStats(String userId, LocalDate date) {
        log.debug("Getting daily stats for user {} on date {}", userId, date);
        return getDailyStatsInternal(userId, date);
    }

    /**
     * Internal method to get daily stats without transaction boundary issues
     */
    private DailyStatsDto getDailyStatsInternal(String userId, LocalDate date) {
        // Try to get pre-calculated stats first
        Optional<StudySessionStats> cachedStats = studySessionStatsRepository
                .findByUserIdAndTypeAndStatsDate(userId, StudySessionStats.StatsType.DAILY, date);

        if (cachedStats.isPresent()) {
            StudySessionStats stats = cachedStats.get();
            return DailyStatsDto.builder()
                    .date(date)
                    .dayOfWeek(date.getDayOfWeek().name())
                    .durationMinutes(stats.getDurationMinutes())
                    .sessionCount(stats.getSessionCount())
                    .build();
        }

        // Calculate on-the-fly if not cached
        return calculateDailyStatsOnTheFly(userId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyStatsDto getWeeklyStats(String userId, LocalDate startDate) {
        log.debug("Getting weekly stats for user {} starting from {}", userId, startDate);
        return getWeeklyStatsInternal(userId, startDate);
    }

    /**
     * Internal method to get weekly stats without transaction boundary issues
     */
    private WeeklyStatsDto getWeeklyStatsInternal(String userId, LocalDate startDate) {
        // Ensure startDate is a Monday
        LocalDate monday = startDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        List<DailyStatsDto> dailyStats = new ArrayList<>();
        long totalDuration = 0;
        int totalSessions = 0;

        // Get stats for each day of the week
        for (LocalDate date = monday; !date.isAfter(sunday); date = date.plusDays(1)) {
            DailyStatsDto dayStats = getDailyStatsInternal(userId, date);
            dailyStats.add(dayStats);
            totalDuration += dayStats.getDurationMinutes();
            totalSessions += dayStats.getSessionCount();
        }

        String weekLabel = String.format("Week of %s", 
                monday.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));

        return WeeklyStatsDto.builder()
                .startDate(monday)
                .endDate(sunday)
                .weekLabel(weekLabel)
                .dailyStats(dailyStats)
                .totalDurationMinutes(totalDuration)
                .totalSessionCount(totalSessions)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public YearlyStatsDto getMonthlyStats(String userId, int year) {
        log.debug("Getting monthly stats for user {} for year {}", userId, year);

        List<StudySessionStats> monthlyStats = studySessionStatsRepository
                .findMonthlyStatsByYear(userId, year);

        // Create a map for quick lookup
        Map<Integer, StudySessionStats> statsMap = monthlyStats.stream()
                .collect(Collectors.toMap(
                        stats -> stats.getStatsDate().getMonthValue(),
                        stats -> stats
                ));

        List<MonthlyStatsDto> monthlyStatsList = new ArrayList<>();
        long totalDuration = 0;
        int totalSessions = 0;

        // Generate stats for all 12 months
        for (int month = 1; month <= 12; month++) {
            StudySessionStats stats = statsMap.get(month);
            
            MonthlyStatsDto monthDto;
            if (stats != null) {
                monthDto = MonthlyStatsDto.builder()
                        .month(Month.of(month).name())
                        .monthNumber(month)
                        .year(year)
                        .durationMinutes(stats.getDurationMinutes())
                        .sessionCount(stats.getSessionCount())
                        .build();
                totalDuration += stats.getDurationMinutes();
                totalSessions += stats.getSessionCount();
            } else {
                // No data for this month
                monthDto = MonthlyStatsDto.builder()
                        .month(Month.of(month).name())
                        .monthNumber(month)
                        .year(year)
                        .durationMinutes(0L)
                        .sessionCount(0)
                        .build();
            }

            monthlyStatsList.add(monthDto);
        }

        return YearlyStatsDto.builder()
                .year(year)
                .monthlyStats(monthlyStatsList)
                .totalDurationMinutes(totalDuration)
                .totalSessionCount(totalSessions)
                .build();
    }

    @Override
    @Transactional
    public void calculateAndStoreDailyStats(String userId, LocalDate date) {
        log.debug("Calculating and storing daily stats for user {} on date {}", userId, date);
        calculateAndStoreDailyStatsInternal(userId, date);
    }

    /**
     * Internal method to calculate and store daily stats without transaction boundary issues
     */
    private void calculateAndStoreDailyStatsInternal(String userId, LocalDate date) {
        DailyStatsDto dailyStats = calculateDailyStatsOnTheFly(userId, date);

        // Save or update the daily stats
        StudySessionStats stats = studySessionStatsRepository
                .findByUserIdAndTypeAndStatsDate(userId, StudySessionStats.StatsType.DAILY, date)
                .orElse(StudySessionStats.builder()
                        .userId(userId)
                        .statsDate(date)
                        .type(StudySessionStats.StatsType.DAILY)
                        .startDate(date)
                        .endDate(date)
                        .build());

        stats.setDurationMinutes(dailyStats.getDurationMinutes());
        stats.setSessionCount(dailyStats.getSessionCount());

        studySessionStatsRepository.save(stats);
        log.debug("Saved daily stats for user {} on date {}: {} minutes, {} sessions", 
                userId, date, dailyStats.getDurationMinutes(), dailyStats.getSessionCount());
    }

    @Override
    @Transactional
    public void calculateDailyStatsForAllUsers(LocalDate date) {
        log.info("Calculating daily stats for all users on date {}", date);

        // Get all unique user IDs who had sessions on this date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<StudySession> sessions = studySessionRepository
                .findByStartTimeBetween(startOfDay, endOfDay);

        Set<String> userIds = sessions.stream()
                .map(StudySession::getUserId)
                .collect(Collectors.toSet());

        log.info("Found {} unique users with sessions on {}", userIds.size(), date);

        // Calculate stats for each user
        for (String userId : userIds) {
            try {
                calculateAndStoreDailyStatsInternal(userId, date);
            } catch (Exception e) {
                log.error("Failed to calculate daily stats for user {} on date {}", userId, date, e);
            }
        }

        log.info("Completed calculating daily stats for all users on date {}", date);
    }

    @Override
    @Transactional
    public void recalculateStats(String userId, LocalDate startDate, LocalDate endDate) {
        log.info("Recalculating stats for user {} from {} to {}", userId, startDate, endDate);

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            calculateAndStoreDailyStatsInternal(userId, date);
        }

        log.info("Completed recalculating stats for user {} from {} to {}", userId, startDate, endDate);
    }

    /**
     * Calculate daily stats on-the-fly without caching
     */
    private DailyStatsDto calculateDailyStatsOnTheFly(String userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<StudySession> sessions = studySessionRepository
                .findByUserIdAndStartTimeBetween(userId, startOfDay, endOfDay);

        long totalDuration = sessions.stream()
                .mapToLong(this::calculateSessionDuration)
                .sum();

        return DailyStatsDto.builder()
                .date(date)
                .dayOfWeek(date.getDayOfWeek().name())
                .durationMinutes(totalDuration)
                .sessionCount(sessions.size())
                .build();
    }

    /**
     * Calculate the duration of a study session in minutes
     */
    private long calculateSessionDuration(StudySession session) {
        if (session.getDurationMinutes() != null) {
            return session.getDurationMinutes();
        }

        if (session.getEndTime() != null) {
            return java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        }

        // For sessions without end time, calculate based on last heartbeat
        if (session.getLastHeartbeat() != null) {
            return java.time.Duration.between(session.getStartTime(), session.getLastHeartbeat()).toMinutes();
        }

        // Default to 0 if we can't calculate duration
        return 0L;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyStatsDto> getDailyStatsRange(String userId, int days) {
        log.debug("Getting daily stats range for user {} for {} days", userId, days);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays((long) days - 1);
        
        List<DailyStatsDto> statsList = new ArrayList<>();
        DailyStatsDto previousDayStats = null;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DailyStatsDto stats = getDailyStatsInternal(userId, date);
            
            // Calculate percentage change from previous day
            if (previousDayStats != null) {
                Double percentageChange = calculatePercentageChange(
                    stats.getDurationMinutes(), 
                    previousDayStats.getDurationMinutes()
                );
                stats.setPercentageChange(percentageChange);
            } else {
                // For the first day, get yesterday's stats to calculate percentage
                LocalDate yesterday = date.minusDays(1);
                DailyStatsDto yesterdayStats = getDailyStatsInternal(userId, yesterday);
                Double percentageChange = calculatePercentageChange(
                    stats.getDurationMinutes(), 
                    yesterdayStats.getDurationMinutes()
                );
                stats.setPercentageChange(percentageChange);
            }
            
            statsList.add(stats);
            previousDayStats = stats;
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyStatsDto> getWeeklyStatsRange(String userId, int weeks) {
        log.debug("Getting weekly stats range for user {} for {} weeks", userId, weeks);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusWeeks((long) weeks - 1);
        
        List<WeeklyStatsDto> statsList = new ArrayList<>();
        WeeklyStatsDto previousWeekStats = null;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusWeeks(1)) {
            WeeklyStatsDto stats = getWeeklyStatsInternal(userId, date);
            
            // Calculate percentage change from previous week
            if (previousWeekStats != null) {
                Double percentageChange = calculatePercentageChange(
                    stats.getTotalDurationMinutes(), 
                    previousWeekStats.getTotalDurationMinutes()
                );
                stats.setPercentageChange(percentageChange);
            } else {
                // For the first week, get previous week's stats to calculate percentage
                LocalDate previousWeekDate = date.minusWeeks(1);
                WeeklyStatsDto previousWeek = getWeeklyStatsInternal(userId, previousWeekDate);
                Double percentageChange = calculatePercentageChange(
                    stats.getTotalDurationMinutes(), 
                    previousWeek.getTotalDurationMinutes()
                );
                stats.setPercentageChange(percentageChange);
            }
            
            statsList.add(stats);
            previousWeekStats = stats;
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyStatsDto> getMonthlyStatsRange(String userId, int months) {
        log.debug("Getting monthly stats range for user {} for {} months", userId, months);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths((long) months - 1);
        
        List<MonthlyStatsDto> statsList = new ArrayList<>();
        LocalDate currentMonth = startDate.withDayOfMonth(1);
        MonthlyStatsDto previousMonthStats = null;
        
        while (!currentMonth.isAfter(endDate.withDayOfMonth(1))) {
            LocalDate monthStart = currentMonth;
            LocalDate monthEnd = currentMonth.withDayOfMonth(currentMonth.lengthOfMonth());
            
            // Get all daily stats for this month
            long totalDuration = 0;
            int totalSessions = 0;
            
            for (LocalDate date = monthStart; !date.isAfter(monthEnd) && !date.isAfter(LocalDate.now()); date = date.plusDays(1)) {
                DailyStatsDto dayStats = getDailyStatsInternal(userId, date);
                totalDuration += dayStats.getDurationMinutes();
                totalSessions += dayStats.getSessionCount();
            }
            
            // Create a proper monthly stats DTO
            MonthlyStatsDto monthStats = MonthlyStatsDto.builder()
                    .month(monthStart.getMonth().name())
                    .monthNumber(monthStart.getMonthValue())
                    .year(monthStart.getYear())
                    .durationMinutes(totalDuration)
                    .sessionCount(totalSessions)
                    .build();
            
            // Calculate percentage change from previous month
            if (previousMonthStats != null) {
                Double percentageChange = calculatePercentageChange(
                    monthStats.getDurationMinutes(), 
                    previousMonthStats.getDurationMinutes()
                );
                monthStats.setPercentageChange(percentageChange);
            } else {
                // For the first month, get previous month's stats to calculate percentage
                LocalDate previousMonthDate = currentMonth.minusMonths(1);
                long prevTotalDuration = 0;
                
                LocalDate prevMonthStart = previousMonthDate.withDayOfMonth(1);
                LocalDate prevMonthEnd = previousMonthDate.withDayOfMonth(previousMonthDate.lengthOfMonth());
                
                for (LocalDate date = prevMonthStart; !date.isAfter(prevMonthEnd); date = date.plusDays(1)) {
                    DailyStatsDto dayStats = getDailyStatsInternal(userId, date);
                    prevTotalDuration += dayStats.getDurationMinutes();
                }
                
                Double percentageChange = calculatePercentageChange(totalDuration, prevTotalDuration);
                monthStats.setPercentageChange(percentageChange);
            }
            
            statsList.add(monthStats);
            previousMonthStats = monthStats;
            currentMonth = currentMonth.plusMonths(1);
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<YearlyStatsDto> getYearlyStatsRange(String userId, int years) {
        log.debug("Getting yearly stats range for user {} for {} years", userId, years);
        
        int endYear = LocalDate.now().getYear();
        int startYear = endYear - years + 1;
        
        List<YearlyStatsDto> statsList = new ArrayList<>();
        YearlyStatsDto previousYearStats = null;
        
        for (int year = startYear; year <= endYear; year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd = LocalDate.of(year, 12, 31);
            LocalDate actualEnd = yearEnd.isAfter(LocalDate.now()) ? LocalDate.now() : yearEnd;
            
            // Get all daily stats for this year and group by month
            Map<Integer, Long> monthlyDurations = new HashMap<>();
            Map<Integer, Integer> monthlySessions = new HashMap<>();
            
            for (LocalDate date = yearStart; !date.isAfter(actualEnd); date = date.plusDays(1)) {
                DailyStatsDto dayStats = getDailyStatsInternal(userId, date);
                int month = date.getMonthValue();
                
                monthlyDurations.merge(month, dayStats.getDurationMinutes(), Long::sum);
                monthlySessions.merge(month, dayStats.getSessionCount(), Integer::sum);
            }
            
            // Create monthly stats for this year
            List<MonthlyStatsDto> monthlyStats = new ArrayList<>();
            long totalDuration = 0;
            int totalSessions = 0;
            
            for (int month = 1; month <= 12; month++) {
                long duration = monthlyDurations.getOrDefault(month, 0L);
                int sessions = monthlySessions.getOrDefault(month, 0);
                
                MonthlyStatsDto monthDto = MonthlyStatsDto.builder()
                        .month(Month.of(month).name())
                        .monthNumber(month)
                        .year(year)
                        .durationMinutes(duration)
                        .sessionCount(sessions)
                        .build();
                
                monthlyStats.add(monthDto);
                totalDuration += duration;
                totalSessions += sessions;
            }
            
            // Create a yearly stats DTO
            YearlyStatsDto yearlyStats = YearlyStatsDto.builder()
                    .year(year)
                    .monthlyStats(monthlyStats)
                    .totalDurationMinutes(totalDuration)
                    .totalSessionCount(totalSessions)
                    .build();
            
            // Calculate percentage change from previous year
            if (previousYearStats != null) {
                Double percentageChange = calculatePercentageChange(
                    yearlyStats.getTotalDurationMinutes(), 
                    previousYearStats.getTotalDurationMinutes()
                );
                yearlyStats.setPercentageChange(percentageChange);
            } else {
                // For the first year, get previous year's stats to calculate percentage
                int previousYear = year - 1;
                long prevYearTotalDuration = 0;
                
                LocalDate prevYearStart = LocalDate.of(previousYear, 1, 1);
                LocalDate prevYearEnd = LocalDate.of(previousYear, 12, 31);
                
                for (LocalDate date = prevYearStart; !date.isAfter(prevYearEnd); date = date.plusDays(1)) {
                    DailyStatsDto dayStats = getDailyStatsInternal(userId, date);
                    prevYearTotalDuration += dayStats.getDurationMinutes();
                }
                
                Double percentageChange = calculatePercentageChange(totalDuration, prevYearTotalDuration);
                yearlyStats.setPercentageChange(percentageChange);
            }
            
            statsList.add(yearlyStats);
            previousYearStats = yearlyStats;
        }
        
        return statsList;
    }

    /**
     * Calculate percentage change between two values
     */
    private Double calculatePercentageChange(Long currentValue, Long previousValue) {
        if (previousValue == null || previousValue == 0) {
            return currentValue != null && currentValue > 0 ? 100.0 : 0.0;
        }
        if (currentValue == null) {
            return -100.0;
        }
        return ((double) (currentValue - previousValue) / previousValue) * 100.0;
    }
}
