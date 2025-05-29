package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LeaderboardEntryDto;
import com.study4ever.progressservice.dto.LeaderboardResponseDto;
import com.study4ever.progressservice.model.PeriodType;
import com.study4ever.progressservice.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Slf4j
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/daily")
    public ResponseEntity<LeaderboardResponseDto> getDailyLeaderboard(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("Getting daily leaderboard for date: {} with limit: {}", targetDate, limit);
        
        LeaderboardResponseDto leaderboard = leaderboardService.getDailyLeaderboard(targetDate, limit);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/weekly")
    public ResponseEntity<LeaderboardResponseDto> getWeeklyLeaderboard(
            @RequestParam(value = "startDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        LocalDate weekStart = startDate != null ? startDate : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        log.info("Getting weekly leaderboard for week starting: {} with limit: {}", weekStart, limit);
        
        LeaderboardResponseDto leaderboard = leaderboardService.getWeeklyLeaderboard(weekStart, limit);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/monthly")
    public ResponseEntity<LeaderboardResponseDto> getMonthlyLeaderboard(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();
        
        log.info("Getting monthly leaderboard for {}/{} with limit: {}", targetYear, targetMonth, limit);
        
        LeaderboardResponseDto leaderboard = leaderboardService.getMonthlyLeaderboard(targetYear, targetMonth, limit);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/yearly")
    public ResponseEntity<LeaderboardResponseDto> getYearlyLeaderboard(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        int targetYear = year != null ? year : LocalDate.now().getYear();
        log.info("Getting yearly leaderboard for {} with limit: {}", targetYear, limit);
        
        LeaderboardResponseDto leaderboard = leaderboardService.getYearlyLeaderboard(targetYear, limit);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/user/{userId}/rank")
    public ResponseEntity<LeaderboardEntryDto> getUserRank(
            @PathVariable String userId,
            @RequestParam PeriodType periodType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting rank for user: {} in period: {} from {} to {}", userId, periodType, startDate, endDate);
        
        LeaderboardEntryDto userRank = leaderboardService.getUserRankForPeriod(userId, periodType, startDate, endDate);
        return ResponseEntity.ok(userRank);
    }

    @PostMapping("/recalculate")
    public ResponseEntity<String> recalculateLeaderboard(
            @RequestParam PeriodType periodType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Recalculating leaderboard for period: {} from {} to {}", periodType, startDate, endDate);
        
        leaderboardService.recalculateLeaderboard(periodType, startDate, endDate);
        
        String message = String.format("Leaderboard recalculation triggered for %s period from %s to %s", 
                periodType.name().toLowerCase(), startDate, endDate);
        
        return ResponseEntity.ok(message);
    }
}
