package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.ModuleProgressDto;

import java.util.List;

public interface ModuleProgressService {

    ModuleProgressDto getModuleProgress(String userId, String courseId, String moduleId);

    ModuleProgressDto initializeModuleProgress(String userId, String courseId, String moduleId, Integer totalLessonsCount);

    List<ModuleProgressDto> getAllModulesProgressInCourse(String userId, String courseId);

    void updateLastAccessed(String userId, String courseId, String moduleId);
}
