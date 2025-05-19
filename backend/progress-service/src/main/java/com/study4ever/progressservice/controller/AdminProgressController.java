package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.CourseCompletionStatisticsDto;
import com.study4ever.progressservice.dto.CourseProgressSummaryDto;
import com.study4ever.progressservice.dto.EnrollmentStatisticsDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.service.AdminProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/progress")
@RequiredArgsConstructor
@Slf4j
public class AdminProgressController {

    private final AdminProgressService adminProgressService;

    @GetMapping("/users/{userId}")
    public UserProgressDto getUserProgress(@PathVariable String userId) {
        log.debug("Admin: Getting user progress for user {}", userId);
        return adminProgressService.getAllUserProgress(0, 1).stream()
                .filter(progress -> progress.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    @GetMapping("/users")
    public List<UserProgressDto> getAllUsersProgress(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.debug("Admin: Getting all users progress, page {}, size {}", page, size);
        return adminProgressService.getAllUserProgress(page, size);
    }

    @GetMapping("/courses/{courseId}")
    public CourseProgressSummaryDto getCourseProgressSummary(@PathVariable String courseId) {
        log.debug("Admin: Getting course progress summary for course {}", courseId);
        return adminProgressService.getCourseProgressSummary(courseId);
    }

    @GetMapping("/courses")
    public List<CourseProgressSummaryDto> getAllCourseProgressSummaries() {
        log.debug("Admin: Getting all course progress summaries");
        return adminProgressService.getAllCourseProgressSummaries();
    }

    @GetMapping("/enrollments")
    public EnrollmentStatisticsDto getEnrollmentStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Admin: Getting enrollment statistics from {} to {}", startDate, endDate);
        return adminProgressService.getNewEnrollmentsByDateRange(startDate, endDate);
    }

    @GetMapping("/courses/{courseId}/completions")
    public CourseCompletionStatisticsDto getCourseCompletionStatistics(
            @PathVariable String courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Admin: Getting course completion statistics for course {} from {} to {}", courseId, startDate, endDate);
        return adminProgressService.getCourseCompletionsByDateRange(courseId, startDate, endDate);
    }

    @DeleteMapping("/users/{userId}/reset")
    public void resetUserProgress(
            @PathVariable String userId,
            @RequestParam(required = false) String courseId) {
        if (courseId != null) {
            log.debug("Admin: Resetting progress for user {} in course {}", userId, courseId);
        } else {
            log.debug("Admin: Resetting all progress for user {}", userId);
        }
        adminProgressService.resetUserProgress(userId, courseId);
    }
}
