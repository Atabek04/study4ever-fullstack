package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.repository.LessonRepository;
import com.study4ever.courseservice.service.LessonService;
import com.study4ever.courseservice.util.mapper.LessonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;

    @Override
    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    @Override
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id).orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Override
    public Lesson createLesson(LessonRequestDto lessonRequestDto) {
        Lesson lesson = new Lesson();
        lessonMapper.mapToLesson(lesson, lessonRequestDto);
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson updateLesson(Long id, LessonRequestDto lessonRequestDto) {
        Lesson existingLesson = getLessonById(id);
        lessonMapper.mapToLesson(existingLesson, lessonRequestDto);
        return lessonRepository.save(existingLesson);
    }

    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }
}