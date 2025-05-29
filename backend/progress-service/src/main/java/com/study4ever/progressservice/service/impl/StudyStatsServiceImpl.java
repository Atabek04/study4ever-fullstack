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

        // Ensure startDate is a Monday
        LocalDate monday = startDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        List<DailyStatsDto> dailyStats = new ArrayList<>();
        long totalDuration = 0;
        int totalSessions = 0;

        // Get stats for each day of the week
        for (LocalDate date = monday; !date.isAfter(sunday); date = date.plusDays(1)) {
            DailyStatsDto dayStats = getDailyStats(userId, date);
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
    @Transactional(readOnly = true)
    public YearlyStatsDto getStatsSummary(String userId, int year) {
        return getMonthlyStats(userId, year);
    }

    @Override
    @Transactional
    public void calculateAndStoreDailyStats(String userId, LocalDate date) {
        log.debug("Calculating and storing daily stats for user {} on date {}", userId, date);

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
                calculateAndStoreDailyStats(userId, date);
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
            calculateAndStoreDailyStats(userId, date);
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
        LocalDate startDate = endDate.minusDays(days - 1);
        
        List<DailyStatsDto> statsList = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DailyStatsDto stats = getDailyStats(userId, date);
            statsList.add(stats);
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyStatsDto> getWeeklyStatsRange(String userId, int weeks) {
        log.debug("Getting weekly stats range for user {} for {} weeks", userId, weeks);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusWeeks(weeks - 1);
        
        List<WeeklyStatsDto> statsList = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusWeeks(1)) {
            WeeklyStatsDto stats = getWeeklyStats(userId, date);
            statsList.add(stats);
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyStatsDto> getMonthlyStatsRange(String userId, int months) {
        log.debug("Getting monthly stats range for user {} for {} months", userId, months);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months - 1);
        
        // Group by month and return as daily stats with aggregated data
        List<DailyStatsDto> statsList = new ArrayList<>();
        LocalDate currentMonth = startDate.withDayOfMonth(1);
        
        while (!currentMonth.isAfter(endDate.withDayOfMonth(1))) {
            LocalDate monthStart = currentMonth;
            LocalDate monthEnd = currentMonth.withDayOfMonth(currentMonth.lengthOfMonth());
            
            // Get all daily stats for this month
            long totalDuration = 0;
            int totalSessions = 0;
            
            for (LocalDate date = monthStart; !date.isAfter(monthEnd) && !date.isAfter(LocalDate.now()); date = date.plusDays(1)) {
                DailyStatsDto dayStats = getDailyStats(userId, date);
                totalDuration += dayStats.getDurationMinutes();
                totalSessions += dayStats.getSessionCount();
            }
            
            // Create a monthly summary as a daily stat
            DailyStatsDto monthSummary = DailyStatsDto.builder()
                    .date(monthStart)
                    .dayOfWeek(monthStart.getMonth().name())
                    .durationMinutes(totalDuration)
                    .sessionCount(totalSessions)
                    .build();
            
            statsList.add(monthSummary);
            currentMonth = currentMonth.plusMonths(1);
        }
        
        return statsList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyStatsDto> getYearlyStatsRange(String userId, int years) {
        log.debug("Getting yearly stats range for user {} for {} years", userId, years);
        
        int endYear = LocalDate.now().getYear();
        int startYear = endYear - years + 1;
        
        List<DailyStatsDto> statsList = new ArrayList<>();
        
        for (int year = startYear; year <= endYear; year++) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd = LocalDate.of(year, 12, 31);
            LocalDate actualEnd = yearEnd.isAfter(LocalDate.now()) ? LocalDate.now() : yearEnd;
            
            // Get all daily stats for this year
            long totalDuration = 0;
            int totalSessions = 0;
            
            for (LocalDate date = yearStart; !date.isAfter(actualEnd); date = date.plusDays(1)) {
                DailyStatsDto dayStats = getDailyStats(userId, date);
                totalDuration += dayStats.getDurationMinutes();
                totalSessions += dayStats.getSessionCount();
            }
            
            // Create a yearly summary as a daily stat
            DailyStatsDto yearSummary = DailyStatsDto.builder()
                    .date(yearStart)
                    .dayOfWeek(String.valueOf(year))
                    .durationMinutes(totalDuration)
                    .sessionCount(totalSessions)
                    .build();
            
            statsList.add(yearSummary);
        }
        
        return statsList;
    }
}
