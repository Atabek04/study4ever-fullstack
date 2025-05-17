package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules/{moduleId}/lessons")
@RequiredArgsConstructor
public class LessonProgressController {

    @GetMapping("/{lessonId}/progress")
    public LessonProgressDto getLessonProgress(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        // Implementation will be added later
        return null;
    }

    @PutMapping("/{lessonId}/progress/complete")
    @ResponseStatus(HttpStatus.OK)
    public void completeLessonProgress(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        // Implementation will be added later
    }
}
