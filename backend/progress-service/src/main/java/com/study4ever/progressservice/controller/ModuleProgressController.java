package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@RequiredArgsConstructor
public class ModuleProgressController {

    @GetMapping("/{moduleId}/progress")
    public ModuleProgressDto getModuleProgress(
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        // Implementation will be added later
        return null;
    }

    @PutMapping("/{moduleId}/progress")
    @ResponseStatus(HttpStatus.OK)
    public ModuleProgressDto updateModuleProgress(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @RequestBody ModuleProgressUpdateRequest request) {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/{moduleId}/lessons/progress")
    public List<LessonProgressDto> getAllLessonsProgressInModule(
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        // Implementation will be added later
        return null;
    }
}
