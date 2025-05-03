package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.model.Lesson;
import java.util.List;

public interface LessonService {
    
    List<Lesson> getAllLessons();

    Lesson getLessonById(Long id);

    Lesson createLesson(LessonRequestDto lessonRequestDto);

    Lesson updateLesson(Long id, LessonRequestDto lessonRequestDto);

    void deleteLesson(Long id);
}