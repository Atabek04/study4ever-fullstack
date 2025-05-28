package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.client.CourseServiceClient;
import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.NextLessonDto;
import com.study4ever.progressservice.exception.BadRequestException;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserProgressService userProgressService;
    private final CourseServiceClient courseServiceClient;

    @Override
    public CourseProgressDto getCourseProgress(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(ProgressMapper::mapToCourseDto)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
    }

    @Override
    @Transactional
    public void enrollInCourse(String userId, String courseId, CourseEnrollmentRequest request) {
        var existingProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingProgress.isPresent()) {
            throw new BadRequestException("User " + userId + " is already enrolled in course " + courseId);
        }

        var courseProgress = CourseProgress.builder()
                .userId(userId)
                .courseId(courseId)
                .status(ProgressStatus.NOT_STARTED)
                .completionPercentage(0.0f)
                .completedLessonsCount(0)
                .totalLessonsCount(request.getTotalLessonsCount())
                .totalModulesCount(request.getTotalModulesCount())
                .enrollmentDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .completed(false)
                .build();

        courseProgressRepository.save(courseProgress);
        log.info("User {} enrolled in course with id {}", userId, courseId);
    }

    @Override
    public List<CourseProgressDto> getAllCourseProgress(String userId) {
        return courseProgressRepository.findByUserId(userId).stream()
                .map(ProgressMapper::mapToCourseDto)
                .toList();
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId) {
        if (userId == null || userId.isBlank() || courseId == null || courseId.isBlank()) {
            throw new BadRequestException("User ID and course ID are required");
        }

        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setLastAccessDate(LocalDateTime.now());

        if (courseProgress.getStatus() == ProgressStatus.NOT_STARTED) {
            courseProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }

        courseProgressRepository.save(courseProgress);
        log.debug("Updated last access time for user {} and course {}", userId, courseId);
    }

    @Override
    @Transactional
    public void markCourseCompleted(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        if (courseProgress.getStatus() == ProgressStatus.COMPLETED) {
            throw new BadRequestException("Course " + courseId + " is already completed by user " + userId);
        }
        if (courseProgress.getCompletedLessonsCount() < courseProgress.getTotalLessonsCount()) {
            throw new BadRequestException("Cannot mark course " + courseId + " as completed. Not all lessons are completed.");
        }

        courseProgress.setStatus(ProgressStatus.COMPLETED);
        courseProgress.setCompleted(true);
        courseProgress.setCompletionPercentage(100.0f);
        courseProgress.setCompletionDate(LocalDateTime.now());
        courseProgressRepository.save(courseProgress);

        userProgressService.increaseCompletedCoursesCount(userId);

        log.info("Marked course {} as completed for user {}", courseId, userId);
    }

    @Override
    @Transactional
    public void resetCourseProgress(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setStatus(ProgressStatus.NOT_STARTED);
        courseProgress.setCompleted(false);
        courseProgress.setCompletionDate(null);
        courseProgress.setCompletionPercentage(0.0f);
        courseProgress.setLastAccessDate(LocalDateTime.now());
        courseProgress.setCurrentModuleId(null);
        courseProgress.setCurrentLessonId(null);
        courseProgress.setCompletedLessonsCount(0);

        courseProgressRepository.save(courseProgress);
        moduleProgressRepository.deleteByUserIdAndCourseId(userId, courseId);
        lessonProgressRepository.deleteByUserIdAndCourseId(userId, courseId);

        log.info("Reset course progress for user {} and course {}", userId, courseId);
    }

    public Integer updateCompletedLessonsCount(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
        var lessons = lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);

        long completedLessonsCount = lessons.stream()
                .filter(lesson -> lesson.getStatus() == ProgressStatus.COMPLETED)
                .count();

        courseProgress.setCompletedLessonsCount((int) completedLessonsCount);
        courseProgress.setCompletionPercentage((float) completedLessonsCount / courseProgress.getTotalLessonsCount() * 100);

        if (completedLessonsCount == courseProgress.getTotalLessonsCount()) {
            courseProgress.setStatus(ProgressStatus.COMPLETED);
            courseProgress.setCompletionDate(LocalDateTime.now());
        } else if (completedLessonsCount > 0) {
            courseProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }
        courseProgressRepository.save(courseProgress);

        return (int) completedLessonsCount;
    }

    @Override
    public void removeEnrolledCourse(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgressRepository.delete(courseProgress);
        log.info("Removed course {} from enrolled courses for user {}", courseId, userId);
    }
    
    @Override
    public NextLessonDto getNextLesson(String userId, String courseId) {
        log.info("Finding next lesson for user {} in course {}", userId, courseId);
        
        // First, get the course progress to check if the user is enrolled
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
        
        // Get all completed lesson IDs for this user in this course
        List<String> completedLessonIds = lessonProgressRepository.findByUserIdAndCourseIdAndStatus(userId, courseId, ProgressStatus.COMPLETED)
                .stream()
                .map(lessonProgress -> lessonProgress.getLessonId())
                .toList();
        log.debug("User has completed {} lessons in course {}", completedLessonIds.size(), courseId);
        
        // Get course details from Course Service to find all lessons and modules
        Map<String, Object> courseDetails = courseServiceClient.getCourseDetails(courseId);
        if (courseDetails == null) {
            throw new NotFoundException("Course details not found for course " + courseId);
        }
        
        // Extract modules from the course details
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> modules = (List<Map<String, Object>>) courseDetails.get("modules");
        if (modules == null || modules.isEmpty()) {
            throw new NotFoundException("No modules found for course " + courseId);
        }
        
        // Find the next incomplete lesson
        for (Map<String, Object> module : modules) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lessons = (List<Map<String, Object>>) module.get("lessons");
            
            if (lessons != null && !lessons.isEmpty()) {
                for (Map<String, Object> lesson : lessons) {
                    String lessonId = String.valueOf(lesson.get("id"));
                    
                    // If this lesson is not completed, this is our next lesson
                    if (!completedLessonIds.contains(lessonId)) {
                        // Update course progress to track current lesson and module
                        courseProgress.setCurrentLessonId(lessonId);
                        courseProgress.setCurrentModuleId(String.valueOf(module.get("id")));
                        courseProgress.setLastAccessDate(LocalDateTime.now());
                        courseProgressRepository.save(courseProgress);
                        
                        // Calculate course completion percentage
                        double completionPercentage = calculateCompletionPercentage(completedLessonIds.size(), 
                            courseProgress.getTotalLessonsCount());
                            
                        // Build and return the DTO
                        return NextLessonDto.builder()
                            .lessonId(lessonId)
                            .lessonTitle((String) lesson.get("title"))
                            .moduleId(String.valueOf(module.get("id")))
                            .moduleTitle((String) module.get("title"))
                            .courseCompletionPercentage(completionPercentage)
                            .lastUpdated(LocalDateTime.now().toString())
                            .build();
                    }
                }
            }
        }
        
        // If all lessons are completed, return the last lesson as the next lesson
        // This happens when the user has completed the entire course
        String lastModuleId = null;
        String lastModuleTitle = null;
        String lastLessonId = null;
        String lastLessonTitle = null;
        
        // Get the last module and lesson
        if (!modules.isEmpty()) {
            Map<String, Object> lastModule = modules.get(modules.size() - 1);
            lastModuleId = String.valueOf(lastModule.get("id"));
            lastModuleTitle = (String) lastModule.get("title");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lessons = (List<Map<String, Object>>) lastModule.get("lessons");
            if (lessons != null && !lessons.isEmpty()) {
                Map<String, Object> lastLesson = lessons.get(lessons.size() - 1);
                lastLessonId = String.valueOf(lastLesson.get("id"));
                lastLessonTitle = (String) lastLesson.get("title");
            }
        }
        
        // Return the last lesson with 100% completion
        return NextLessonDto.builder()
            .lessonId(lastLessonId)
            .lessonTitle(lastLessonTitle)
            .moduleId(lastModuleId)
            .moduleTitle(lastModuleTitle)
            .courseCompletionPercentage(100.0)
            .lastUpdated(LocalDateTime.now().toString())
            .build();
    }
    
    /**
     * Calculate completion percentage based on completed lessons count and total lessons
     */
    private double calculateCompletionPercentage(int completedCount, int totalCount) {
        if (totalCount == 0) return 0;
        return (double) completedCount / totalCount * 100;
    }
}
