package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.model.LessonProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.LessonProgressService;
import com.study4ever.progressservice.service.ModuleProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressServiceImpl implements LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    private final CourseProgressService courseProgressService;
    private final ModuleProgressService moduleProgressService;

    @Override
    public LessonProgressDto getLessonProgress(String userId, String courseId, String moduleId, String lessonId) {
        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId)
                .map(ProgressMapper::mapToLessonDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public LessonProgressDto initializeLessonProgress(String userId, String courseId, String moduleId, String lessonId) {
        // Check if progress already exists
        var existingProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId);
        if (existingProgress.isPresent()) {
            return ProgressMapper.mapToLessonDto(existingProgress.get());
        }

        // Check if module progress exists
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isEmpty()) {
            // Initialize module progress first
            moduleProgressService.initializeModuleProgress(userId, courseId, moduleId);
        }

        // Create new lesson progress
        var lessonProgress = LessonProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .lessonId(lessonId)
                .status(ProgressStatus.NOT_STARTED)
                .firstAccessDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .studyTimeMinutes(0L)
                .build();

        var savedProgress = lessonProgressRepository.save(lessonProgress);
        log.info("Initialized lesson progress for user {} and lesson {}", userId, lessonId);
        
        // Update module last accessed
        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);
        
        return ProgressMapper.mapToLessonDto(savedProgress);
    }

    @Override
    public List<LessonProgressDto> getAllLessonsProgressInModule(String userId, String courseId, String moduleId) {
        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId).stream()
                .map(ProgressMapper::mapToLessonDto)
                .toList();
    }

    @Override
    @Transactional
    public LessonProgressDto updateLessonProgress(String userId, String courseId, String moduleId, String lessonId, Float completionPercentage) {
        var lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId);
        
        if (lessonProgress.isEmpty()) {
            // Initialize if not exists
            return initializeLessonProgress(userId, courseId, moduleId, lessonId);
        }

        var progress = lessonProgress.get();
        progress.setLastAccessDate(LocalDateTime.now());
        
        // Update status based on completion percentage
        if (completionPercentage != null) {
            if (completionPercentage >= 100) {
                progress.setStatus(ProgressStatus.COMPLETED);
                progress.setCompletionDate(LocalDateTime.now());
            } else if (completionPercentage > 0) {
                progress.setStatus(ProgressStatus.IN_PROGRESS);
            }
        }
        
        var updatedProgress = lessonProgressRepository.save(progress);
        
        // Update module progress
        updateModuleLessonProgress(userId, courseId, moduleId);
        
        return ProgressMapper.mapToLessonDto(updatedProgress);
    }

    @Override
    @Transactional
    public void markLessonCompleted(String userId, String courseId, String moduleId, String lessonId) {
        var lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId);
        
        if (lessonProgress.isEmpty()) {
            // Check if module progress exists and initialize if needed
            var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
            if (moduleProgress.isEmpty()) {
                // Initialize module progress first
                moduleProgressService.initializeModuleProgress(userId, courseId, moduleId);
            }
            
            // Create new lesson progress already marked as completed
            var progress = LessonProgress.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .lessonId(lessonId)
                    .status(ProgressStatus.COMPLETED)
                    .firstAccessDate(LocalDateTime.now())
                    .lastAccessDate(LocalDateTime.now())
                    .completionDate(LocalDateTime.now())
                    .studyTimeMinutes(0L)
                    .build();
                    
            lessonProgressRepository.save(progress);
        } else {
            var progress = lessonProgress.get();
            progress.setStatus(ProgressStatus.COMPLETED);
            progress.setCompletionDate(LocalDateTime.now());
            lessonProgressRepository.save(progress);
        }
        
        // Update module progress
        updateModuleLessonProgress(userId, courseId, moduleId);
        
        log.info("Marked lesson {} as completed for user {}", lessonId, userId);
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId, String moduleId, String lessonId) {
        var lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId);
        
        if (lessonProgress.isEmpty()) {
            // Check if module progress exists and initialize if needed
            var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
            if (moduleProgress.isEmpty()) {
                // Initialize module progress first
                moduleProgressService.initializeModuleProgress(userId, courseId, moduleId);
            }
            
            // Create new lesson progress
            var progress = LessonProgress.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .lessonId(lessonId)
                    .status(ProgressStatus.NOT_STARTED)
                    .firstAccessDate(LocalDateTime.now())
                    .lastAccessDate(LocalDateTime.now())
                    .studyTimeMinutes(0L)
                    .build();
                    
            lessonProgressRepository.save(progress);
            log.info("Initialized lesson progress during updateLastAccessed for user {} and lesson {}", userId, lessonId);
        } else {
            var progress = lessonProgress.get();
            progress.setLastAccessDate(LocalDateTime.now());
            
            // If lesson was not started, mark it as in progress
            if (progress.getStatus() == ProgressStatus.NOT_STARTED) {
                progress.setStatus(ProgressStatus.IN_PROGRESS);
            }
            
            lessonProgressRepository.save(progress);
        }
        
        // Update module progress
        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);
        
        log.debug("Updated last access time for user {} and lesson {}", userId, lessonId);
    }

    // Helper methods for updating module progress based on lesson progress
    private void updateModuleLessonProgress(String userId, String courseId, String moduleId) {
        var lessons = lessonProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        int totalLessons = lessons.size();
        long completedLessons = lessons.stream()
                .filter(l -> l.getStatus() == ProgressStatus.COMPLETED)
                .count();
        
        // Find module progress
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isPresent() && totalLessons > 0) {
            var progress = moduleProgress.get();
            
            // Calculate percentage
            float percentage = ((float) completedLessons / totalLessons) * 100;
            progress.setCompletionPercentage(percentage);
            
            // Update status based on completion
            if (completedLessons == totalLessons) {
                progress.setStatus(ProgressStatus.COMPLETED);
                progress.setCompletionDate(LocalDateTime.now());
            } else if (completedLessons > 0) {
                progress.setStatus(ProgressStatus.IN_PROGRESS);
            }
            
            moduleProgressRepository.save(progress);
            
            // Also update course progress
            courseProgressService.updateLastAccessed(userId, courseId);
            
            log.debug("Updated module progress for user {} and module {}: {}%", userId, moduleId, percentage);
        }
    }
}
