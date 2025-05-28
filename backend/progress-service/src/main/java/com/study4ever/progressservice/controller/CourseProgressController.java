package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.dto.NextLessonDto;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.LessonProgressService;
import com.study4ever.progressservice.service.ModuleProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseProgressController {

    private final CourseProgressService courseProgressService;
    private final ModuleProgressService moduleProgressService;
    private final LessonProgressService lessonProgressService;

    @PostMapping("/{courseId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public String enrollInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @Valid @RequestBody CourseEnrollmentRequest request) {
        log.debug("Initializing course progress for user {} and course {}", userId, courseId);
        courseProgressService.enrollInCourse(userId, courseId, request);
        return String.format("User %s enrolled in course with id: %s successfully", userId, courseId);
    }

    @GetMapping("/progress")
    public List<CourseProgressDto> getAllCoursesProgress(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting all courses progress for user {}", userId);
        return courseProgressService.getAllCourseProgress(userId);
    }

    @GetMapping("/{courseId}/progress")
    public CourseProgressDto getCourseProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting course progress for user {} and course {}", userId, courseId);
        return courseProgressService.getCourseProgress(userId, courseId);
    }

    @GetMapping("/enrolled-courses")
    public List<String> getEnrolledCourses(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting all enrolled courses for user {}", userId);
        return courseProgressService.getAllCourseProgress(userId)
                .stream()
                .map(CourseProgressDto::getCourseId)
                .toList();
    }

    @PutMapping("/{courseId}/progress/complete")
    public String markCourseCompleted(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Marking course {} as completed for user {}", courseId, userId);
        courseProgressService.markCourseCompleted(userId, courseId);
        return "Course marked as completed successfully";
    }

    @DeleteMapping("/{courseId}/progress/reset")
    public String resetCourseProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Resetting progress for user {} in course {}", userId, courseId);
        courseProgressService.resetCourseProgress(userId, courseId);
        return "Course progress reset successfully";
    }

    @DeleteMapping("/{courseId}/progress/remove")
    public String removeCourseFromEnrolledCourses(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Removing course {} from enrolled courses for user {}", courseId, userId);
        courseProgressService.removeEnrolledCourse(userId, courseId);
        return "Course removed from enrolled courses successfully";
    }

    @GetMapping("/{courseId}/modules/progress")
    public List<ModuleProgressDto> getAllModulesProgressInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting all modules progress for user {} in course {}", userId, courseId);
        return moduleProgressService.getAllModulesProgressInCourse(userId, courseId);
    }

    // get all completed lessons id in course
    @GetMapping("/{courseId}/completed")
    public List<String> getCompletedLessonsInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting all completed lessons for user {} in course {}", userId, courseId);
        return lessonProgressService.getCompletedLessonsInCourse(userId, courseId);
    }
    
    /**
     * Retrieves the next lesson a user should continue with in a course.
     * If the user has completed lessons, it returns the first uncompleted lesson.
     * If all lessons are completed, it returns the last lesson in the course.
     * If no lessons are completed, it returns the first lesson in the course.
     *
     * @param userId   The user's ID from the X-User-Id header
     * @param courseId The course ID from the URL path
     * @return The next lesson to continue with, with module information
     */
    @GetMapping("/{courseId}/continue-learning")
    public NextLessonDto getNextLesson(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.info("Getting next lesson for user {} in course {}", userId, courseId);
        return courseProgressService.getNextLesson(userId, courseId);
    }
}
