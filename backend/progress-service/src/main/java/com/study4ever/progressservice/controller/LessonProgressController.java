package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.service.LessonProgressService;
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
@RequestMapping("/api/v1/courses/{courseId}/modules/{moduleId}/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

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

    @GetMapping("/progress")
    public List<LessonProgressDto> getAllLessonsProgressInModule(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @PathVariable String moduleId) {
        log.debug("Getting all lessons progress for user {} in course {}, module {}",
                userId, courseId, moduleId);
        return lessonProgressService.getAllLessonsProgressInModule(userId, courseId, moduleId);
    }

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
