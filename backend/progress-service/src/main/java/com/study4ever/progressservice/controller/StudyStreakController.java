package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.StreakHistoryEntryDto;
import com.study4ever.progressservice.dto.StudyStreakDto;
import com.study4ever.progressservice.service.StudyStreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/streaks")
@RequiredArgsConstructor
@Slf4j
public class StudyStreakController {

    private final StudyStreakService studyStreakService;

    @GetMapping
    public StudyStreakDto getUserStreak(@RequestHeader("X-User-Id") String userId) {
        log.debug("Getting study streak for user {}", userId);
        studyStreakService.updateStreak(userId);
        return studyStreakService.getUserStreak(userId);
    }

    @GetMapping("/history/by-date-range")
    public List<StreakHistoryEntryDto> getStreakHistoryByDateRange(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Getting streak history for user {} from {} to {}", userId, startDate, endDate);
        return studyStreakService.getStreakHistoryByDateRange(userId, startDate, endDate);
    }

    @PutMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetStreak(@RequestHeader("X-User-Id") String userId) {
        log.debug("Resetting streak for user {}", userId);
        studyStreakService.resetStreak(userId);
    }

    @GetMapping("/top")
    public List<StudyStreakDto> getTopStreaks(@RequestParam(defaultValue = "10") int limit) {
        log.debug("Getting top {} streaks", limit);
        return studyStreakService.getTopStreaks(limit);
    }
}
