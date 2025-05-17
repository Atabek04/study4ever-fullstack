package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    
    @Override
    public CourseProgressDto getCourseProgress(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(ProgressMapper::mapToCourseDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public CourseProgressDto initializeProgress(String userId, String courseId, CourseEnrollmentRequest request) {
        // Check if progress already exists
        var existingProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingProgress.isPresent()) {
            return ProgressMapper.mapToCourseDto(existingProgress.get());
        }

        // Create new progress
        var courseProgress = CourseProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .courseId(courseId)
                .courseTitle(request.getCourseTitle())
                .status(ProgressStatus.NOT_STARTED)
                .completionPercentage(0.0f)
                .completedLessonsCount(0)
                .totalLessonsCount(0)
                .enrollmentDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .completed(false)
                .build();

        var savedProgress = courseProgressRepository.save(courseProgress);
        log.info("Initialized course progress for user {} and course {}", userId, courseId);
        
        return ProgressMapper.mapToCourseDto(savedProgress);
    }

    @Override
    public List<CourseProgressDto> getAllCourseProgress(String userId) {
        return courseProgressRepository.findByUserId(userId).stream()
                .map(ProgressMapper::mapToCourseDto)
                .toList();
    }

    @Override
    public List<ModuleProgressDto> getAllModulesProgressInCourse(String userId, String courseId) {
        // Check if the user is enrolled in the course
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isEmpty()) {
            return Collections.emptyList();
        }

        return moduleProgressRepository.findByUserIdAndCourseId(userId, courseId).stream()
                .map(ProgressMapper::mapToModuleDto)
                .toList();
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isPresent()) {
            var progress = courseProgress.get();
            progress.setLastAccessDate(LocalDateTime.now());
            
            // If course was not started, mark it as in progress
            if (progress.getStatus() == ProgressStatus.NOT_STARTED) {
                progress.setStatus(ProgressStatus.IN_PROGRESS);
            }
            
            courseProgressRepository.save(progress);
            log.debug("Updated last access time for user {} and course {}", userId, courseId);
        }
    }

    @Override
    @Transactional
    public void markCourseCompleted(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isPresent()) {
            var progress = courseProgress.get();
            progress.setStatus(ProgressStatus.COMPLETED);
            progress.setCompleted(true);
            progress.setCompletionPercentage(100.0f);
            progress.setCompletionDate(LocalDateTime.now());
            courseProgressRepository.save(progress);
            log.info("Marked course {} as completed for user {}", courseId, userId);
        }
    }
    
    @Override
    @Transactional
    public void enrollInCourse(String userId, String courseId) {
        // Check if already enrolled
        var existingProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingProgress.isPresent()) {
            log.info("User {} is already enrolled in course {}", userId, courseId);
            return;
        }
        
        // Create enrollment request
        CourseEnrollmentRequest request = new CourseEnrollmentRequest();
        request.setCourseId(courseId);
        
        // Initialize progress
        initializeProgress(userId, courseId, request);
        log.info("Enrolled user {} in course {}", userId, courseId);
    }
    
    @Override
    @Transactional
    public void resetCourseProgress(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course progress not found for user " + userId + " and course " + courseId));
        
        // Reset progress
        courseProgress.setStatus(ProgressStatus.NOT_STARTED);
        courseProgress.setCompleted(false);
        courseProgress.setCompletionDate(null);
        courseProgress.setCompletionPercentage(0.0f);
        courseProgress.setLastAccessDate(LocalDateTime.now());
        courseProgress.setCurrentModuleId(null);
        courseProgress.setCurrentLessonId(null);
        courseProgress.setCompletedLessonsCount(0);
        
        courseProgressRepository.save(courseProgress);
        
        // Delete related module and lesson progress
        moduleProgressRepository.deleteByUserIdAndCourseId(userId, courseId);
        
        log.info("Reset course progress for user {} and course {}", userId, courseId);
    }

}
