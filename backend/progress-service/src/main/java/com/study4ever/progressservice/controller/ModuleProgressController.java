package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressUpdateRequest;
import com.study4ever.progressservice.service.ModuleProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@RequiredArgsConstructor
@Slf4j
public class ModuleProgressController {

    private final ModuleProgressService moduleProgressService;

    @GetMapping("/{moduleId}/progress")
    public ModuleProgressDto getModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.getModuleProgress(userId, courseId, moduleId);
    }

    @PutMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.OK)
    public ModuleProgressDto updateModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @RequestBody ModuleProgressUpdateRequest request) {
        log.debug("Updating module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.updateModuleProgress(userId, courseId, moduleId, request);
    }

    @GetMapping("/{moduleId}/lessons/progress")
    public List<LessonProgressDto> getAllLessonsProgressInModule(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting all lessons progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.getAllLessonsProgressInModule(userId, courseId, moduleId);
    }
    
    @PostMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleProgressDto initializeModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Initializing module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.initializeModuleProgress(userId, courseId, moduleId);
    }
    
    @PutMapping("/{moduleId}/progress/complete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markModuleCompleted(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Marking module as completed for user {} in course {} and module {}", userId, courseId, moduleId);
        moduleProgressService.markModuleCompleted(userId, courseId, moduleId);
    }
    
    @PutMapping("/{moduleId}/progress/update-access")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateLastAccessed(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Updating last accessed for user {} in course {} and module {}", userId, courseId, moduleId);
        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);
    }
}
