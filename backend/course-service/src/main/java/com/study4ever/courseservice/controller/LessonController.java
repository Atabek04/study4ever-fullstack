package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Lesson createLesson(@Valid @RequestBody LessonRequestDto lessonRequestDto) {
        return lessonService.createLesson(lessonRequestDto);
    }

    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonService.getAllLessons();
    }

    @GetMapping("/{id}")
    public Lesson getLessonById(@PathVariable("id") Long id) {
        return lessonService.getLessonById(id);
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
    public Lesson getLessonContent(
            @PathVariable("courseId") String courseId,
            @PathVariable("moduleId") String moduleId, 
            @PathVariable("lessonId") String lessonId,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Getting lesson content for course: {}, module: {}, lesson: {}, user: {}", 
                courseId, moduleId, lessonId, userId);
                
        Lesson lesson = lessonService.getLessonByModuleIdAndLessonId(moduleId, lessonId);
        
        return lesson;
    }

    @PutMapping("/{id}")
    public Lesson updateLesson(@PathVariable("id") Long id, @Valid @RequestBody LessonRequestDto lessonRequestDto) {
        return lessonService.updateLesson(id, lessonRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable("id") Long id) {
        lessonService.deleteLesson(id);
    }
}