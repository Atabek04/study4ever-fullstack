package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.service.ModuleProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@RequiredArgsConstructor
@Slf4j
public class ModuleProgressController {

    private final ModuleProgressService moduleProgressService;

    @PostMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleProgressDto initializeModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Initializing module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.initializeModuleProgress(userId, courseId, moduleId);
    }

    @GetMapping("/progress")
    public List<ModuleProgressDto> getAllModulesProgressInCourse(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId) {
        log.debug("Getting all modules progress for user {} in course {}", userId, courseId);
        return moduleProgressService.getAllModulesProgressInCourse(userId, courseId);
    }

    @GetMapping("/{moduleId}/progress")
    public ModuleProgressDto getModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.getModuleProgress(userId, courseId, moduleId);
    }

    @GetMapping("/{moduleId}/lessons/progress")
    public List<LessonProgressDto> getAllLessonsProgressInModule(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting all lessons progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.getAllLessonsProgressInModule(userId, courseId, moduleId);
    }

    @PutMapping("/{moduleId}/progress/complete")
    public void markModuleCompleted(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Marking module as completed for user {} in course {} and module {}", userId, courseId, moduleId);
        moduleProgressService.markModuleCompleted(userId, courseId, moduleId);
    }

    @PutMapping("/{moduleId}/progress/update-access")
    public void updateLastAccessed(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Updating last accessed for user {} in course {} and module {}", userId, courseId, moduleId);
        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);
    }
}
