package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.service.ModuleProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@RequiredArgsConstructor
@Slf4j
public class ModuleProgressController {

    private final ModuleProgressService moduleProgressService;

    @PostMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleProgressDto startNewModule(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @RequestParam Integer totalLessonsCount) {
        log.debug("Initializing module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.initializeModuleProgress(userId, courseId, moduleId, totalLessonsCount);
    }

    @GetMapping("/{moduleId}/progress")
    public ModuleProgressDto getModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        return moduleProgressService.getModuleProgress(userId, courseId, moduleId);
    }

    @DeleteMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeModuleProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Removing module progress for user {} in course {} and module {}", userId, courseId, moduleId);
        moduleProgressService.removeModuleProgress(userId, courseId, moduleId);
    }
}
