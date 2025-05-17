package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;
import com.study4ever.progressservice.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
@Slf4j
public class ProgressController {

    private final UserProgressService userProgressService;

    @GetMapping
    public UserProgressDto getCurrentUserProgress(@RequestHeader("X-User-Id") String userId) {
        log.debug("Getting current user progress for user {}", userId);
        return userProgressService.getUserProgress(userId);
    }

    @GetMapping("/statistics")
    public UserStatisticsDto getUserStatistics(@RequestHeader("X-User-Id") String userId) {
        log.debug("Getting user statistics for user {}", userId);
        return userProgressService.getUserStatistics(userId);
    }
}
