package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.DailyStatsDto;
import com.study4ever.progressservice.dto.WeeklyStatsDto;
import com.study4ever.progressservice.dto.MonthlyStatsDto;
import com.study4ever.progressservice.dto.YearlyStatsDto;
import com.study4ever.progressservice.service.StudyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions/stats")
@RequiredArgsConstructor
@Slf4j
public class StudyStatsController {

    private final StudyStatsService studyStatsService;

    @GetMapping("/daily")
    public List<DailyStatsDto> getDailyStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching daily stats for user {} for the last {} days", userId, days);
        return studyStatsService.getDailyStatsRange(userId, days);
    }

    @GetMapping("/weekly")
    public List<WeeklyStatsDto> getWeeklyStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "12") int weeks) {
        log.info("Fetching weekly stats for user {} for the last {} weeks", userId, weeks);
        return studyStatsService.getWeeklyStatsRange(userId, weeks);
    }

    @GetMapping("/monthly")
    public List<MonthlyStatsDto> getMonthlyStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "12") int months) {
        log.info("Fetching monthly stats for user {} for the last {} months", userId, months);
        return studyStatsService.getMonthlyStatsRange(userId, months);
    }

    @GetMapping("/yearly")
    public List<YearlyStatsDto> getYearlyStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "5") int years) {
        log.info("Fetching yearly stats for user {} for the last {} years", userId, years);
        return studyStatsService.getYearlyStatsRange(userId, years);
    }

    @GetMapping("/summary")
    public YearlyStatsDto getStatsSummary(@RequestHeader("X-User-Id") String userId) {
        log.info("Fetching monthly stats for user {} for current year", userId);
        int currentYear = LocalDate.now().getYear();
        return studyStatsService.getMonthlyStats(userId, currentYear);
    }

    @PostMapping("/recalculate")
    public String recalculateStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Recalculating stats for user {} from {} to {}", userId, startDate, endDate);
        studyStatsService.recalculateStats(userId, startDate, endDate);
        return "Statistics recalculated successfully";
    }
}
