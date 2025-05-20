package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.ModuleProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleProgressServiceImpl implements ModuleProgressService {

    private final ModuleProgressRepository moduleProgressRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final CourseProgressService courseProgressService;

    @Override
    public ModuleProgressDto getModuleProgress(String userId, String courseId, String moduleId) {
        return moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId)
                .map(ProgressMapper::mapToModuleDto)
                .orElseThrow(() -> new NotFoundException("Module progress not found for user " +
                        userId + " in course " + courseId + " and module " + moduleId));
    }

    @Override
    @Transactional
    public ModuleProgressDto initializeModuleProgress(String userId, String courseId, String moduleId, Integer totalLessonsCount) {
        var existingProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (existingProgress.isPresent()) {
            return ProgressMapper.mapToModuleDto(existingProgress.get());
        }

        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isEmpty()) {
            throw new NotFoundException("Course progress not found for user " +
                    userId + " in course " + courseId);
        }

        var moduleProgress = ModuleProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .status(ProgressStatus.NOT_STARTED)
                .completionPercentage(0.0f)
                .firstAccessDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .totalLessonsCount(totalLessonsCount)
                .build();

        var savedProgress = moduleProgressRepository.save(moduleProgress);
        log.info("Initialized module progress for user {} and module {}", userId, moduleId);

        courseProgressService.updateLastAccessed(userId, courseId);

        return ProgressMapper.mapToModuleDto(savedProgress);
    }

    @Override
    public List<ModuleProgressDto> getAllModulesProgressInCourse(String userId, String courseId) {
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
    public void updateLastAccessed(String userId, String courseId, String moduleId) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId)
                .orElseThrow(() -> new NotFoundException("Module progress not found for user " +
                        userId + " in course " + courseId + " and module " + moduleId));


        moduleProgress.setLastAccessDate(LocalDateTime.now());

        if (moduleProgress.getStatus() == ProgressStatus.NOT_STARTED) {
            moduleProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }

        moduleProgressRepository.save(moduleProgress);
        courseProgressService.updateLastAccessed(userId, courseId);

        log.debug("Updated last access time for user {} and module {}", userId, moduleId);
    }

}
