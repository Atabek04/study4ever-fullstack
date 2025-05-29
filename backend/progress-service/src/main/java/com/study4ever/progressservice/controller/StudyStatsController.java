package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.DailyStatsDto;
import com.study4ever.progressservice.dto.WeeklyStatsDto;
import com.study4ever.progressservice.dto.YearlyStatsDto;
import com.study4ever.progressservice.service.StudyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/stats")
@RequiredArgsConstructor
@Slf4j
public class StudyStatsController {

    private final StudyStatsService studyStatsService;

    /**
     * Get daily statistics for the authenticated user
     */
    @GetMapping("/daily/{userId}")
    public ResponseEntity<List<DailyStatsDto>> getDailyStats(
            @PathVariable String userId,
            @RequestParam(defaultValue = "30") int days) {
        
        log.debug("Getting daily stats for user {} for {} days", userId, days);
        
        List<DailyStatsDto> statsList = studyStatsService.getDailyStatsRange(userId, days);
        return ResponseEntity.ok(statsList);
    }

    /**
     * Get weekly statistics for the authenticated user
     */
    @GetMapping("/weekly/{userId}")
    public ResponseEntity<List<WeeklyStatsDto>> getWeeklyStats(
            @PathVariable String userId,
            @RequestParam(defaultValue = "12") int weeks) {
        
        log.debug("Getting weekly stats for user {} for {} weeks", userId, weeks);
        
        List<WeeklyStatsDto> statsList = studyStatsService.getWeeklyStatsRange(userId, weeks);
        return ResponseEntity.ok(statsList);
    }

    /**
     * Get monthly statistics for the authenticated user for a specific year
     */
    @GetMapping("/monthly/{userId}")
    public ResponseEntity<List<DailyStatsDto>> getMonthlyStats(
            @PathVariable String userId,
            @RequestParam(defaultValue = "12") int months) {
        
        log.debug("Getting monthly stats for user {} for {} months", userId, months);
        
        List<DailyStatsDto> statsList = studyStatsService.getMonthlyStatsRange(userId, months);
        return ResponseEntity.ok(statsList);
    }

    /**
     * Get yearly statistics summary for the authenticated user
     */
    @GetMapping("/yearly/{userId}")
    public ResponseEntity<List<DailyStatsDto>> getYearlyStats(
            @PathVariable String userId,
            @RequestParam(defaultValue = "5") int years) {
        
        log.debug("Getting yearly stats for user {} for {} years", userId, years);
        
        List<DailyStatsDto> statsList = studyStatsService.getYearlyStatsRange(userId, years);
        return ResponseEntity.ok(statsList);
    }

    /**
     * Get summary statistics for the authenticated user (current year)
     */
    @GetMapping("/summary/{userId}")
    public ResponseEntity<YearlyStatsDto> getStatsSummary(@PathVariable String userId) {
        int currentYear = LocalDate.now().getYear();
        
        log.debug("Getting stats summary for user {} for current year {}", userId, currentYear);
        
        YearlyStatsDto stats = studyStatsService.getStatsSummary(userId, currentYear);
        return ResponseEntity.ok(stats);
    }

    /**
     * Recalculate statistics for a date range (admin or user action)
     * This can be useful for data corrections or manual recalculation
     */
    @PostMapping("/recalculate/{userId}")
    public ResponseEntity<String> recalculateStats(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Recalculating stats for user {} from {} to {}", userId, startDate, endDate);
        
        studyStatsService.recalculateStats(userId, startDate, endDate);
        
        return ResponseEntity.ok("Statistics recalculated successfully");
    }
}
