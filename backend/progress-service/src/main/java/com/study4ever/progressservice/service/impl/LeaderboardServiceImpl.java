package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.LeaderboardEntryDto;
import com.study4ever.progressservice.dto.LeaderboardResponseDto;
import com.study4ever.progressservice.model.LeaderboardRankings;
import com.study4ever.progressservice.model.PeriodType;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.repository.LeaderboardRankingsRepository;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaderboardServiceImpl implements LeaderboardService {

    private final LeaderboardRankingsRepository leaderboardRepository;
    private final StudySessionRepository studySessionRepository;

    @Override
    public LeaderboardResponseDto getDailyLeaderboard(LocalDate date, int limit) {
        log.debug("Getting daily leaderboard for date: {} with limit: {}", date, limit);

        Pageable pageable = PageRequest.of(0, limit);
        List<LeaderboardRankings> rankings = leaderboardRepository
                .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.DAILY, date, pageable);

        if (rankings.isEmpty()) {
            log.info("No pre-calculated daily leaderboard found for {}, calculating on-the-fly", date);
            calculateDailyLeaderboard(date);
            rankings = leaderboardRepository
                    .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.DAILY, date, pageable);
        }

        List<LeaderboardEntryDto> entries = rankings.stream()
                .map(this::convertToLeaderboardEntry)
                .toList();

        return LeaderboardResponseDto.builder()
                .entries(entries)
                .periodType(PeriodType.DAILY)
                .startDate(date)
                .endDate(date)
                .totalEntries(entries.size())
                .build();
    }

    @Override
    public LeaderboardResponseDto getWeeklyLeaderboard(LocalDate startDate, int limit) {
        log.debug("Getting weekly leaderboard for week starting: {} with limit: {}", startDate, limit);

        // Ensure startDate is a Monday
        LocalDate weekStart = startDate.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        Pageable pageable = PageRequest.of(0, limit);
        List<LeaderboardRankings> rankings = leaderboardRepository
                .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.WEEKLY, weekStart, pageable);

        if (rankings.isEmpty()) {
            log.info("No pre-calculated weekly leaderboard found for {}, calculating on-the-fly", weekStart);
            calculateWeeklyLeaderboard(weekStart);
            rankings = leaderboardRepository
                    .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.WEEKLY, weekStart, pageable);
        }

        List<LeaderboardEntryDto> entries = rankings.stream()
                .map(this::convertToLeaderboardEntry)
                .toList();

        return LeaderboardResponseDto.builder()
                .entries(entries)
                .periodType(PeriodType.WEEKLY)
                .startDate(weekStart)
                .endDate(weekStart.plusDays(6))
                .totalEntries(entries.size())
                .build();
    }

    @Override
    public LeaderboardResponseDto getMonthlyLeaderboard(int year, int month, int limit) {
        log.debug("Getting monthly leaderboard for {}/{} with limit: {}", year, month, limit);

        LocalDate startDate = LocalDate.of(year, month, 1);

        Pageable pageable = PageRequest.of(0, limit);
        List<LeaderboardRankings> rankings = leaderboardRepository
                .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.MONTHLY, startDate, pageable);

        if (rankings.isEmpty()) {
            log.info("No pre-calculated monthly leaderboard found for {}/{}, calculating on-the-fly", year, month);
            calculateMonthlyLeaderboard(year, month);
            rankings = leaderboardRepository
                    .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.MONTHLY, startDate, pageable);
        }

        List<LeaderboardEntryDto> entries = rankings.stream()
                .map(this::convertToLeaderboardEntry)
                .toList();

        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        return LeaderboardResponseDto.builder()
                .entries(entries)
                .periodType(PeriodType.MONTHLY)
                .startDate(startDate)
                .endDate(endDate)
                .totalEntries(entries.size())
                .build();
    }

    @Override
    public LeaderboardResponseDto getYearlyLeaderboard(int year, int limit) {
        log.debug("Getting yearly leaderboard for {} with limit: {}", year, limit);

        LocalDate startDate = LocalDate.of(year, 1, 1);

        Pageable pageable = PageRequest.of(0, limit);
        List<LeaderboardRankings> rankings = leaderboardRepository
                .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.YEARLY, startDate, pageable);

        if (rankings.isEmpty()) {
            log.info("No pre-calculated yearly leaderboard found for {}, calculating on-the-fly", year);
            calculateYearlyLeaderboard(year);
            rankings = leaderboardRepository
                    .findByPeriodTypeAndStartDateOrderByRankAsc(PeriodType.YEARLY, startDate, pageable);
        }

        List<LeaderboardEntryDto> entries = rankings.stream()
                .map(this::convertToLeaderboardEntry)
                .toList();

        LocalDate endDate = LocalDate.of(year, 12, 31);

        return LeaderboardResponseDto.builder()
                .entries(entries)
                .periodType(PeriodType.YEARLY)
                .startDate(startDate)
                .endDate(endDate)
                .totalEntries(entries.size())
                .build();
    }

    @Override
    public LeaderboardEntryDto getUserRankForPeriod(String userId, PeriodType periodType, LocalDate startDate, LocalDate endDate) {
        log.debug("Getting user rank for user: {} in period: {} from {} to {}", userId, periodType, startDate, endDate);

        LeaderboardRankings ranking = leaderboardRepository
                .findByUserIdAndPeriodTypeAndStartDate(userId, periodType, startDate)
                .orElse(null);

        if (ranking == null) {
            // Calculate user's stats for the period
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

            List<StudySession> sessions = studySessionRepository
                    .findByUserIdAndStartTimeBetween(userId, startDateTime, endDateTime);

            long totalDuration = sessions.stream()
                    .filter(session -> session.getEndTime() != null)
                    .mapToLong(session -> java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes())
                    .sum();

            int sessionCount = sessions.size();

            return LeaderboardEntryDto.builder()
                    .userId(userId)
                    .rank(0) // Will be calculated when leaderboard is generated
                    .totalStudyMinutes(totalDuration)
                    .sessionCount(sessionCount)
                    .build();
        }

        return convertToLeaderboardEntry(ranking);
    }

    @Override
    public void calculateDailyLeaderboard(LocalDate date) {
        log.info("Calculating daily leaderboard for date: {}", date);

        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.atTime(LocalTime.MAX);

        // Delete existing rankings for this period
        leaderboardRepository.deleteByPeriodTypeAndStartDate(PeriodType.DAILY, date);

        // Get all study sessions for the day
        List<StudySession> dailySessions = studySessionRepository
                .findByStartTimeBetween(startDateTime, endDateTime);

        // Group by user and calculate totals
        Map<String, UserDayStats> userStats = dailySessions.stream()
                .filter(session -> session.getEndTime() != null)
                .collect(Collectors.groupingBy(
                        StudySession::getUserId,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                sessions -> {
                                    long totalMinutes = sessions.stream()
                                            .mapToLong(session -> java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes())
                                            .sum();
                                    return new UserDayStats(totalMinutes, sessions.size());
                                }
                        )
                ));

        // Create rankings sorted by total study time
        List<LeaderboardRankings> rankings = userStats.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue().totalMinutes, e1.getValue().totalMinutes))
                .map(entry -> {
                    int rank = userStats.values().stream()
                            .mapToInt(userDayStats -> userDayStats.totalMinutes > entry.getValue().totalMinutes ? 1 : 0)
                            .sum() + 1;

                    return LeaderboardRankings.builder()
                            .userId(entry.getKey())
                            .periodType(PeriodType.DAILY)
                            .startDate(date)
                            .endDate(date)
                            .rank(rank)
                            .totalStudyMinutes(entry.getValue().totalMinutes)
                            .sessionCount(entry.getValue().sessionCount)
                            .build();
                })
                .toList();

        // Save rankings
        leaderboardRepository.saveAll(rankings);
        log.info("Saved {} daily leaderboard entries for date: {}", rankings.size(), date);
    }

    @Override
    public void calculateWeeklyLeaderboard(LocalDate weekStart) {
        log.info("Calculating weekly leaderboard for week starting: {}", weekStart);

        LocalDate adjustedWeekStart = weekStart.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = adjustedWeekStart.plusDays(6);

        LocalDateTime startDateTime = adjustedWeekStart.atStartOfDay();
        LocalDateTime endDateTime = weekEnd.atTime(LocalTime.MAX);

        // Delete existing rankings for this period
        leaderboardRepository.deleteByPeriodTypeAndStartDate(PeriodType.WEEKLY, adjustedWeekStart);

        calculateAndSaveLeaderboard(PeriodType.WEEKLY, adjustedWeekStart, weekEnd, startDateTime, endDateTime);
    }

    @Override
    public void calculateMonthlyLeaderboard(int year, int month) {
        log.info("Calculating monthly leaderboard for {}/{}", year, month);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Delete existing rankings for this period
        leaderboardRepository.deleteByPeriodTypeAndStartDate(PeriodType.MONTHLY, startDate);

        calculateAndSaveLeaderboard(PeriodType.MONTHLY, startDate, endDate, startDateTime, endDateTime);
    }

    @Override
    public void calculateYearlyLeaderboard(int year) {
        log.info("Calculating yearly leaderboard for {}", year);

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Delete existing rankings for this period
        leaderboardRepository.deleteByPeriodTypeAndStartDate(PeriodType.YEARLY, startDate);

        calculateAndSaveLeaderboard(PeriodType.YEARLY, startDate, endDate, startDateTime, endDateTime);
    }

    @Override
    public void recalculateLeaderboard(PeriodType periodType, LocalDate startDate, LocalDate endDate) {
        log.info("Recalculating leaderboard for period: {} from {} to {}", periodType, startDate, endDate);

        switch (periodType) {
            case DAILY:
                LocalDate current = startDate;
                while (!current.isAfter(endDate)) {
                    calculateDailyLeaderboard(current);
                    current = current.plusDays(1);
                }
                break;
            case WEEKLY:
                LocalDate weekStart = startDate.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                while (!weekStart.isAfter(endDate)) {
                    calculateWeeklyLeaderboard(weekStart);
                    weekStart = weekStart.plusWeeks(1);
                }
                break;
            case MONTHLY:
                LocalDate monthStart = startDate.withDayOfMonth(1);
                while (!monthStart.isAfter(endDate)) {
                    calculateMonthlyLeaderboard(monthStart.getYear(), monthStart.getMonthValue());
                    monthStart = monthStart.plusMonths(1);
                }
                break;
            case YEARLY:
                int year = startDate.getYear();
                int endYear = endDate.getYear();
                while (year <= endYear) {
                    calculateYearlyLeaderboard(year);
                    year++;
                }
                break;
        }
    }

    private void calculateAndSaveLeaderboard(PeriodType periodType, LocalDate startDate, LocalDate endDate,
                                             LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // Get all study sessions for the period
        List<StudySession> sessions = studySessionRepository
                .findByStartTimeBetween(startDateTime, endDateTime);

        // Group by user and calculate totals
        Map<String, UserDayStats> userStats = sessions.stream()
                .filter(session -> session.getEndTime() != null)
                .collect(Collectors.groupingBy(
                        StudySession::getUserId,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                sessionList -> {
                                    long totalMinutes = sessionList.stream()
                                            .mapToLong(session -> java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes())
                                            .sum();
                                    return new UserDayStats(totalMinutes, sessionList.size());
                                }
                        )
                ));

        // Create rankings sorted by total study time
        List<LeaderboardRankings> rankings = userStats.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue().totalMinutes, e1.getValue().totalMinutes))
                .map(entry -> {
                    int rank = userStats.values().stream()
                            .mapToInt(userDayStats -> userDayStats.totalMinutes > entry.getValue().totalMinutes ? 1 : 0)
                            .sum() + 1;

                    return LeaderboardRankings.builder()
                            .userId(entry.getKey())
                            .periodType(periodType)
                            .startDate(startDate)
                            .endDate(endDate)
                            .rank(rank)
                            .totalStudyMinutes(entry.getValue().totalMinutes)
                            .sessionCount(entry.getValue().sessionCount)
                            .build();
                })
                .toList();

        // Save rankings
        leaderboardRepository.saveAll(rankings);
        log.info("Saved {} {} leaderboard entries for period {} to {}",
                rankings.size(), periodType.name().toLowerCase(), startDate, endDate);
    }

    private LeaderboardEntryDto convertToLeaderboardEntry(LeaderboardRankings ranking) {
        return LeaderboardEntryDto.builder()
                .userId(ranking.getUserId())
                .rank(ranking.getRank())
                .totalStudyMinutes(ranking.getTotalStudyMinutes())
                .sessionCount(ranking.getSessionCount())
                .build();
    }

    // Helper class for grouping user statistics
    private record UserDayStats(long totalMinutes, int sessionCount) {
    }
}
