package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.service.CourseProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseProgressController {

    private final CourseProgressService courseProgressService;

    @GetMapping("/{courseId}/progress")
    public CourseProgressDto getCourseProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting course progress for user {} and course {}", userId, courseId);
        return courseProgressService.getCourseProgress(userId, courseId);
    }

    @PostMapping("/{courseId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public CourseProgressDto initializeCourseProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @Valid @RequestBody CourseEnrollmentRequest request) {
        log.debug("Initializing course progress for user {} and course {}", userId, courseId);
        return courseProgressService.initializeProgress(userId, courseId, request);
    }

    @GetMapping("/progress")
    public List<CourseProgressDto> getAllCoursesProgress(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting all courses progress for user {}", userId);
        return courseProgressService.getAllCourseProgress(userId);
    }

    @GetMapping("/{courseId}/modules/progress")
    public List<ModuleProgressDto> getAllModulesProgressInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting all modules progress in course {} for user {}", courseId, userId);
        return courseProgressService.getAllModulesProgressInCourse(userId, courseId);
    }
    
    @PutMapping("/{courseId}/progress/update-access")
    public String updateLastAccessed(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Updating last accessed for user {} and course {}", userId, courseId);
        courseProgressService.updateLastAccessed(userId, courseId);
        return "Last accessed updated successfully";
    }
    
    @PutMapping("/{courseId}/progress/complete")
    public String markCourseCompleted(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Marking course {} as completed for user {}", courseId, userId);
        courseProgressService.markCourseCompleted(userId, courseId);
        return "Course marked as completed successfully";
    }
    
    @PostMapping("/{courseId}/enroll")
    public String enrollInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Enrolling user {} in course {}", userId, courseId);
        courseProgressService.enrollInCourse(userId, courseId);
        return "Course enrolled successfully";
    }
    
    @DeleteMapping("/{courseId}/progress/reset")
    public String resetCourseProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Resetting progress for user {} in course {}", userId, courseId);
        courseProgressService.resetCourseProgress(userId, courseId);
        return "Course progress reset successfully";
    }
}
