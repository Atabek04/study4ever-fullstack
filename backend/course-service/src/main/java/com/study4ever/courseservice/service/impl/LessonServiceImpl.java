package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.exception.SortOrderConflictException;
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
        return lessonRepository.findById(id).orElseThrow(() -> new NotFoundException("Lesson not found"));
    }

    @Override
    public Lesson createLesson(LessonRequestDto lessonRequestDto) {
        Lesson lesson = new Lesson();

        if (lessonRequestDto.getSortOrder() == null) {
            lessonRequestDto.setSortOrder(getNextSortOrderForModule(lessonRequestDto.getModuleId()));
        } else if (lessonRepository.existsByModuleIdAndSortOrder(
                lessonRequestDto.getModuleId(), lessonRequestDto.getSortOrder())) {
            throw new SortOrderConflictException("Lesson with sort order " + lessonRequestDto.getSortOrder() +
                    " already exists in this module");
        }

        lessonMapper.mapToLesson(lesson, lessonRequestDto);
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson updateLesson(Long id, LessonRequestDto lessonRequestDto) {
        Lesson existingLesson = getLessonById(id);

        if (lessonRequestDto.getSortOrder() == null) {
            lessonRequestDto.setSortOrder(existingLesson.getSortOrder() != null ?
                    existingLesson.getSortOrder() : getNextSortOrderForModule(lessonRequestDto.getModuleId()));
        } else if (!lessonRequestDto.getSortOrder().equals(existingLesson.getSortOrder()) &&
                lessonRepository.existsByModuleIdAndSortOrderAndIdNot(
                        lessonRequestDto.getModuleId(),
                        lessonRequestDto.getSortOrder(),
                        id)) {
            throw new SortOrderConflictException("Lesson with sort order " + lessonRequestDto.getSortOrder() +
                    " already exists in this module");
        }

        lessonMapper.mapToLesson(existingLesson, lessonRequestDto);
        return lessonRepository.save(existingLesson);
    }

    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }

    private Integer getNextSortOrderForModule(Long moduleId) {
        return lessonRepository.findMaxSortOrderByModuleId(moduleId)
                .map(maxSortOrder -> maxSortOrder + 1)
                .orElse(1);
    }
}