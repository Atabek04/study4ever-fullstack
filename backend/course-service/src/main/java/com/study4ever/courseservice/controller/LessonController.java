package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonService.getAllLessons();
    }

    @GetMapping("/{id}")
    public Lesson getLessonById(@PathVariable Long id) {
        return lessonService.getLessonById(id);
    }

    @PostMapping
    public Lesson createLesson(@Valid @RequestBody LessonRequestDto lessonRequestDto) {
        return lessonService.createLesson(lessonRequestDto);
    }

    @PutMapping("/{id}")
    public Lesson updateLesson(@PathVariable Long id, @Valid @RequestBody LessonRequestDto lessonRequestDto) {
        return lessonService.updateLesson(id, lessonRequestDto);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
    }
}