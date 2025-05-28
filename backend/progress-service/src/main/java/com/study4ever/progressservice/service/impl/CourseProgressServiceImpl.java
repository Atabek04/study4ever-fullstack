package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.client.CourseServiceClient;
import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.NextLessonDto;
import com.study4ever.progressservice.dto.client.CourseDetailsDto;
import com.study4ever.progressservice.dto.client.LessonDto;
import com.study4ever.progressservice.dto.client.ModuleDto;
import com.study4ever.progressservice.exception.BadRequestException;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.LessonProgress;
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
import java.util.Comparator;
import java.util.List;
import java.util.Set;

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
        
        var courseProgress = validateUserEnrollment(userId, courseId);
        
        CourseDetailsDto courseDetails = getCourseStructure(courseId);
        
        List<String> completedLessonIds = getCompletedLessonIds(userId, courseId);
        log.debug("User has completed {} lessons in course {}", completedLessonIds.size(), courseId);
        
        List<ModuleDto> sortedModules = sortModulesByOrder(courseDetails.getModules());
        
        NextLessonDto nextLesson = findNextLessonInModules(sortedModules, completedLessonIds, courseProgress);
        
        updateCourseProgressTracking(courseProgress, nextLesson);
        
        return nextLesson;
    }
    
    /**
     * Validates that the user is enrolled in the course
     */
    private CourseProgress validateUserEnrollment(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
    }
    
    /**
     * Gets course structure from Course Service
     */
    private CourseDetailsDto getCourseStructure(String courseId) {
        CourseDetailsDto courseDetails = courseServiceClient.getCourseDetails(courseId);
        if (courseDetails == null) {
            throw new NotFoundException("Course details not found for course " + courseId);
        }
        if (courseDetails.getModules() == null || courseDetails.getModules().isEmpty()) {
            throw new NotFoundException("No modules found for course " + courseId);
        }
        return courseDetails;
    }
    
    /**
     * Gets list of completed lesson IDs for the user in the course
     */
    private List<String> getCompletedLessonIds(String userId, String courseId) {
        return lessonProgressRepository.findByUserIdAndCourseIdAndStatus(userId, courseId, ProgressStatus.COMPLETED)
                .stream()
                .map(LessonProgress::getLessonId)
                .toList();
    }
    
    /**
     * Converts module set to sorted list based on sortOrder
     */
    private List<ModuleDto> sortModulesByOrder(Set<ModuleDto> modules) {
        return modules.stream()
                .sorted(Comparator.comparing(ModuleDto::getSortOrder))
                .toList();
    }
    
    /**
     * Finds the next lesson using proper module-by-module progression
     */
    private NextLessonDto findNextLessonInModules(List<ModuleDto> modules, List<String> completedLessonIds, CourseProgress courseProgress) {
        for (ModuleDto module : modules) {
            List<LessonDto> sortedLessons = sortLessonsByOrder(module.getLessons());
            
            // Check if module is incomplete (has uncompleted lessons)
            boolean moduleComplete = isModuleComplete(sortedLessons, completedLessonIds);
            
            if (!moduleComplete) {
                // Find first uncompleted lesson in this module
                for (LessonDto lesson : sortedLessons) {
                    String lessonId = String.valueOf(lesson.getId());
                    
                    if (!completedLessonIds.contains(lessonId)) {
                        return buildNextLessonDto(lesson, module, courseProgress, completedLessonIds);
                    }
                }
            }
        }
        
        // All lessons completed - return last lesson
        return buildCompletedCourseResponse(modules);
    }
    
    /**
     * Converts lesson set to sorted list based on sortOrder
     */
    private List<LessonDto> sortLessonsByOrder(Set<LessonDto> lessons) {
        return lessons.stream()
                .sorted(Comparator.comparing(LessonDto::getSortOrder))
                .toList();
    }
    
    /**
     * Checks if all lessons in a module are completed
     */
    private boolean isModuleComplete(List<LessonDto> lessons, List<String> completedLessonIds) {
        return lessons.stream()
                .allMatch(lesson -> completedLessonIds.contains(String.valueOf(lesson.getId())));
    }
    
    /**
     * Builds NextLessonDto for the next lesson to study
     */
    private NextLessonDto buildNextLessonDto(LessonDto lesson, ModuleDto module, CourseProgress courseProgress, List<String> completedLessonIds) {
        double completionPercentage = calculateCompletionPercentage(completedLessonIds.size(), courseProgress.getTotalLessonsCount());
        
        return NextLessonDto.builder()
                .lessonId(String.valueOf(lesson.getId()))
                .lessonTitle(lesson.getTitle())
                .moduleId(String.valueOf(module.getId()))
                .moduleTitle(module.getTitle())
                .courseCompletionPercentage(completionPercentage)
                .lastUpdated(LocalDateTime.now().toString())
                .build();
    }
    
    /**
     * Builds response when all lessons are completed
     */
    private NextLessonDto buildCompletedCourseResponse(List<ModuleDto> modules) {
        if (modules.isEmpty()) {
            throw new NotFoundException("No modules found in course");
        }
        
        ModuleDto lastModule = modules.get(modules.size() - 1);
        List<LessonDto> lastModuleLessons = sortLessonsByOrder(lastModule.getLessons());
        
        if (lastModuleLessons.isEmpty()) {
            throw new NotFoundException("No lessons found in last module");
        }
        
        LessonDto lastLesson = lastModuleLessons.get(lastModuleLessons.size() - 1);
        
        return NextLessonDto.builder()
                .lessonId(String.valueOf(lastLesson.getId()))
                .lessonTitle(lastLesson.getTitle())
                .moduleId(String.valueOf(lastModule.getId()))
                .moduleTitle(lastModule.getTitle())
                .courseCompletionPercentage(100.0)
                .lastUpdated(LocalDateTime.now().toString())
                .build();
    }
    
    /**
     * Updates course progress tracking with current lesson/module
     */
    private void updateCourseProgressTracking(CourseProgress courseProgress, NextLessonDto nextLesson) {
        courseProgress.setCurrentLessonId(nextLesson.getLessonId());
        courseProgress.setCurrentModuleId(nextLesson.getModuleId());
        courseProgress.setLastAccessDate(LocalDateTime.now());
        courseProgressRepository.save(courseProgress);
    }
    
    /**
     * Calculate completion percentage based on completed lessons count and total lessons
     */
    private double calculateCompletionPercentage(int completedCount, int totalCount) {
        if (totalCount == 0) return 0;
        return (double) completedCount / totalCount * 100;
    }
}
