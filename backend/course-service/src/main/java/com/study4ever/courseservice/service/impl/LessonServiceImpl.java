package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.exception.SortOrderConflictException;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.service.ActiveStudySessionService;
import com.study4ever.courseservice.repository.LessonRepository;
import com.study4ever.courseservice.service.LessonService;
import com.study4ever.courseservice.util.mapper.LessonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;
    private final ActiveStudySessionService sessionService;

    @Override
    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    @Override
    public Lesson getLessonById(Long id) {
        //        ensureActiveSessionForLesson(lesson); todo: uncomment when session service is available
        return lessonRepository.findById(id).orElseThrow(() -> new NotFoundException("Lesson not found"));
    }

    @Override
    public Lesson getLessonByModuleIdAndLessonId(String moduleId, String lessonId) {
        //        ensureActiveSessionForLesson(lesson); todo: uncomment when session service is available
        return lessonRepository.findByModuleIdAndId(Long.valueOf(moduleId), Long.valueOf(lessonId))
                .orElseThrow(() -> new NotFoundException("Lesson not found for moduleId: " + moduleId + " and lessonId: " + lessonId));
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

    private void ensureActiveSessionForLesson(Lesson lesson) {
        String userId = getCurrentUserId();
        String courseId = lesson.getModule().getCourse().getId().toString();
        String moduleId = lesson.getModule().getId().toString();
        String lessonId = lesson.getId().toString();
        if (!sessionService.hasActiveSession(userId)) {
            sessionService.createSessionWithEvent(userId, courseId, moduleId, lessonId, LocalDateTime.now());
        } else {
            sessionService.updateSessionLocationWithEvent(
                sessionService.findSessionsByUser(userId).get(0).getSessionId(),
                moduleId,
                lessonId,
                java.time.LocalDateTime.now()
            );
        }
    }

    private String getCurrentUserId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new IllegalStateException("No request context available");
        }
        HttpServletRequest request = attrs.getRequest();
        String userId = request.getHeader("X-User-Id");
        if (userId == null || userId.isEmpty()) {
            throw new IllegalStateException("Missing X-User-Id header");
        }
        return userId;
    }
}