package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.dto.LessonResponseDto;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LessonMapper {

    private final ModuleRepository moduleRepository;

    public void mapToLesson(Lesson existingLesson, LessonRequestDto lessonRequestDto) {
        existingLesson.setTitle(lessonRequestDto.getTitle());
        existingLesson.setContent(lessonRequestDto.getContent());
        existingLesson.setVideoUrl(lessonRequestDto.getVideoUrl());
        existingLesson.setDurationMinutes(lessonRequestDto.getDurationMinutes());
        existingLesson.setSortOrder(lessonRequestDto.getSortOrder());
        existingLesson.setModule(moduleRepository.findById(lessonRequestDto.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found")));
    }

    public LessonResponseDto toResponseDto(Lesson lesson) {
        return LessonResponseDto.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .durationMinutes(lesson.getDurationMinutes())
                .sortOrder(lesson.getSortOrder())
                .build();
    }
}