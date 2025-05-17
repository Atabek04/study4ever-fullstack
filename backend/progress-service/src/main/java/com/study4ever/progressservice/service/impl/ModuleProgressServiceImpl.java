package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressUpdateRequest;
import com.study4ever.progressservice.dto.ProgressStatusDto;
import com.study4ever.progressservice.model.ModuleProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.ModuleProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleProgressServiceImpl implements ModuleProgressService {

    private final ModuleProgressRepository moduleProgressRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseProgressService courseProgressService;

    @Override
    public ModuleProgressDto getModuleProgress(String userId, String courseId, String moduleId) {
        return moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId)
                .map(ProgressMapper::mapToModuleDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public ModuleProgressDto initializeModuleProgress(String userId, String courseId, String moduleId) {
        // Check if progress already exists
        var existingProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (existingProgress.isPresent()) {
            return ProgressMapper.mapToModuleDto(existingProgress.get());
        }

        // Check if course progress exists
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isEmpty()) {
            // Initialize course progress first
            courseProgressService.initializeProgress(userId, courseId, null);
        }

        // Create new module progress
        var moduleProgress = ModuleProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .status(ProgressStatus.NOT_STARTED)
                .completionPercentage(0.0f)
                .firstAccessDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .build();

        var savedProgress = moduleProgressRepository.save(moduleProgress);
        log.info("Initialized module progress for user {} and module {}", userId, moduleId);
        
        // Update course last accessed
        courseProgressService.updateLastAccessed(userId, courseId);
        
        return ProgressMapper.mapToModuleDto(savedProgress);
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
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ModuleProgressDto updateModuleProgress(String userId, String courseId, String moduleId, ModuleProgressUpdateRequest request) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isEmpty()) {
            // Initialize if not exists
            return initializeModuleProgress(userId, courseId, moduleId);
        }

        var progress = moduleProgress.get();
        
        // Update status if provided
        if (request != null && request.getStatus() != null) {
            progress.setStatus(ProgressMapper.mapDtoStatus(request.getStatus()));
            
            // If completed, set the completion date
            if (request.getStatus() == ProgressStatusDto.COMPLETED) {
                progress.setCompletionDate(LocalDateTime.now());
                progress.setCompletionPercentage(100.0f);
            }
        }
        
        progress.setLastAccessDate(LocalDateTime.now());
        var updatedProgress = moduleProgressRepository.save(progress);
        
        // Update course progress
        updateCourseModuleProgress(userId, courseId);
        
        return ProgressMapper.mapToModuleDto(updatedProgress);
    }

    @Override
    @Transactional
    public void markModuleCompleted(String userId, String courseId, String moduleId) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isPresent()) {
            var progress = moduleProgress.get();
            progress.setStatus(ProgressStatus.COMPLETED);
            progress.setCompletionPercentage(100.0f);
            progress.setCompletionDate(LocalDateTime.now());
            moduleProgressRepository.save(progress);
            
            // Update course progress
            updateCourseModuleProgress(userId, courseId);
            
            log.info("Marked module {} as completed for user {}", moduleId, userId);
        }
    }

    @Override
    public List<LessonProgressDto> getAllLessonsProgressInModule(String userId, String courseId, String moduleId) {
        // Check if module progress exists
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isEmpty()) {
            return Collections.emptyList();
        }

        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId).stream()
                .map(ProgressMapper::mapToLessonDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId, String moduleId) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        
        if (moduleProgress.isEmpty()) {
            // Initialize if not exists
            initializeModuleProgress(userId, courseId, moduleId);
            return;
        }
        
        var progress = moduleProgress.get();
        progress.setLastAccessDate(LocalDateTime.now());
        
        // If module was not started, mark it as in progress
        if (progress.getStatus() == ProgressStatus.NOT_STARTED) {
            progress.setStatus(ProgressStatus.IN_PROGRESS);
        }
        
        moduleProgressRepository.save(progress);
        
        // Update course progress
        courseProgressService.updateLastAccessed(userId, courseId);
        
        log.debug("Updated last access time for user {} and module {}", userId, moduleId);
    }

    // Helper methods for calculating progress
    private void updateCourseModuleProgress(String userId, String courseId) {
        var modules = moduleProgressRepository.findByUserIdAndCourseId(userId, courseId);
        int totalModules = modules.size();
        long completedModules = modules.stream()
                .filter(m -> m.getStatus() == ProgressStatus.COMPLETED)
                .count();
        
        // Find course progress
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isPresent() && totalModules > 0) {
            var progress = courseProgress.get();
            
            // Calculate percentage
            float percentage = ((float) completedModules / totalModules) * 100;
            progress.setCompletionPercentage(percentage);
            
            // Update status based on completion
            if (completedModules == totalModules) {
                progress.setStatus(ProgressStatus.COMPLETED);
                progress.setCompletionDate(LocalDateTime.now());
            } else if (completedModules > 0) {
                progress.setStatus(ProgressStatus.IN_PROGRESS);
            }
            
            courseProgressRepository.save(progress);
            log.debug("Updated course progress for user {} and course {}: {}%", userId, courseId, percentage);
        }
    }
}
