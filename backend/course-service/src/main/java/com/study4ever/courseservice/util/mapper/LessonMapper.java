package com.study4ever.courseservice.util.mapper;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.dto.LessonResponseDto;
import com.study4ever.courseservice.model.Lesson;

import com.study4ever.courseservice.service.ModuleService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LessonMapper {

    private final ModuleService moduleService;

    public Lesson mapToLesson(Lesson existingLesson, LessonRequestDto lessonRequestDto) {
        existingLesson.setTitle(lessonRequestDto.getTitle());
        existingLesson.setContent(lessonRequestDto.getContent());
        existingLesson.setVideoUrl(lessonRequestDto.getVideoUrl());
        existingLesson.setDurationMinutes(lessonRequestDto.getDurationMinutes());
        existingLesson.setSortOrder(lessonRequestDto.getSortOrder());
        existingLesson.setModule(moduleService.getModuleById(lessonRequestDto.getModuleId()));
        return existingLesson;
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