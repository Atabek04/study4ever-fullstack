package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules/{moduleId}/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @GetMapping("/{lessonId}/progress")
    public LessonProgressDto getLessonProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        log.debug("Getting lesson progress for user {} in course {}, module {}, lesson {}", 
                userId, courseId, moduleId, lessonId);
        return lessonProgressService.getLessonProgress(userId, courseId, moduleId, lessonId);
    }

    @PutMapping("/{lessonId}/progress/complete")
    @ResponseStatus(HttpStatus.OK)
    public void completeLessonProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        log.debug("Marking lesson as completed for user {} in course {}, module {}, lesson {}", 
                userId, courseId, moduleId, lessonId);
        lessonProgressService.markLessonCompleted(userId, courseId, moduleId, lessonId);
    }
    
    @PostMapping("/{lessonId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonProgressDto initializeLessonProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        log.debug("Initializing lesson progress for user {} in course {}, module {}, lesson {}", 
                userId, courseId, moduleId, lessonId);
        return lessonProgressService.initializeLessonProgress(userId, courseId, moduleId, lessonId);
    }
    
    @PutMapping("/{lessonId}/progress")
    @ResponseStatus(HttpStatus.OK)
    public LessonProgressDto updateLessonProgress(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId,
            @RequestParam Float completionPercentage) {
        log.debug("Updating lesson progress with completion percentage {} for user {} in course {}, module {}, lesson {}", 
                completionPercentage, userId, courseId, moduleId, lessonId);
        return lessonProgressService.updateLessonProgress(userId, courseId, moduleId, lessonId, completionPercentage);
    }
    
    @PutMapping("/{lessonId}/progress/update-access")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateLastAccessed(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable String lessonId) {
        log.debug("Updating last accessed for user {} in course {}, module {}, lesson {}", 
                userId, courseId, moduleId, lessonId);
        lessonProgressService.updateLastAccessed(userId, courseId, moduleId, lessonId);
    }
}
