package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.client.ProgressServiceClient;
import com.study4ever.courseservice.dto.HeartbeatRequest;
import com.study4ever.courseservice.dto.LessonRequestDto;
import com.study4ever.courseservice.dto.StudySessionDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.exception.SortOrderConflictException;
import com.study4ever.courseservice.model.Lesson;
import com.study4ever.courseservice.repository.LessonRepository;
import com.study4ever.courseservice.service.LessonService;
import com.study4ever.courseservice.util.mapper.LessonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;
    private final ProgressServiceClient progressServiceClient;

    @Override
    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    @Override
    public Lesson getLessonById(Long id) {
        var lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lesson not found with id: " + id));
        ensureActiveSessionForLesson(lesson);
        return lesson;
    }

    @Override
    public Lesson getLessonByModuleIdAndLessonId(String moduleId, String lessonId) {
        var lesson = lessonRepository.findByModuleIdAndId(Long.valueOf(moduleId), Long.valueOf(lessonId))
                .orElseThrow(() -> new NotFoundException("Lesson not found for moduleId: " + moduleId + " and lessonId: " + lessonId));
        ensureActiveSessionForLesson(lesson);
        return lesson;
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
        
        // Check if user has an active session
        StudySessionDto activeSession = progressServiceClient.getActiveSession(userId);
        
        if (activeSession == null) {
            log.info("No active session found for user {}, session will be created by frontend for course {}, module {}, lesson {}",
                    userId, courseId, moduleId, lessonId);
            // Note: Session creation will be handled by the frontend or another service call
        } else {
            log.info("Recording heartbeat for active session for user {}, course {}, module {}, lesson {}", 
                    userId, courseId, moduleId, lessonId);
            
            // Record heartbeat to update session location
            HeartbeatRequest heartbeatRequest = new HeartbeatRequest();
            heartbeatRequest.setSessionId(activeSession.getSessionId());
            heartbeatRequest.setModuleId(moduleId);
            heartbeatRequest.setLessonId(lessonId);
            
            progressServiceClient.recordHeartbeat(heartbeatRequest);
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