package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.exception.BadRequestException;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;

    @Override
    public CourseProgressDto getCourseProgress(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(ProgressMapper::mapToCourseDto)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
    }

    @Override
    @Transactional
    public CourseProgressDto initializeProgress(String userId, String courseId, CourseEnrollmentRequest request) {
        var existingProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingProgress.isPresent()) {
            return ProgressMapper.mapToCourseDto(existingProgress.get());
        }

        var courseProgress = CourseProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .courseId(courseId)
                .status(ProgressStatus.NOT_STARTED)
                .completionPercentage(0.0f)
                .completedLessonsCount(0)
                .totalLessonsCount(0)   // todo: set this based on the course content
                .enrollmentDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .completed(false)
                .build();

        var savedProgress = courseProgressRepository.save(courseProgress);
        log.info("Initialized course progress for user {} and course {}", userId, courseId);

        return ProgressMapper.mapToCourseDto(savedProgress);
    }

    @Override
    public List<CourseProgressDto> getAllCourseProgress(String userId) {
        return courseProgressRepository.findByUserId(userId).stream()
                .map(ProgressMapper::mapToCourseDto)
                .toList();
    }

    @Override
    public List<ModuleProgressDto> getAllModulesProgressInCourse(String userId, String courseId) {
        courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        return moduleProgressRepository.findByUserIdAndCourseId(userId, courseId).stream()
                .map(ProgressMapper::mapToModuleDto)
                .toList();
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId) {
        if (userId == null || userId.isBlank() || courseId == null || courseId.isBlank()) {
            throw new BadRequestException("User ID and course ID are required");
        }

        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setLastAccessDate(LocalDateTime.now());

        if (courseProgress.getStatus() == ProgressStatus.NOT_STARTED) {
            courseProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }

        courseProgressRepository.save(courseProgress);
        log.debug("Updated last access time for user {} and course {}", userId, courseId);
    }

    @Override
    @Transactional
    public void markCourseCompleted(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setStatus(ProgressStatus.COMPLETED);
        courseProgress.setCompleted(true);
        courseProgress.setCompletionPercentage(100.0f);
        courseProgress.setCompletionDate(LocalDateTime.now());
        courseProgressRepository.save(courseProgress);
        log.info("Marked course {} as completed for user {}", courseId, userId);
    }

    @Override
    @Transactional
    public void resetCourseProgress(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setStatus(ProgressStatus.NOT_STARTED);
        courseProgress.setCompleted(false);
        courseProgress.setCompletionDate(null);
        courseProgress.setCompletionPercentage(0.0f);
        courseProgress.setLastAccessDate(LocalDateTime.now());
        courseProgress.setCurrentModuleId(null);
        courseProgress.setCurrentLessonId(null);
        courseProgress.setCompletedLessonsCount(0);

        courseProgressRepository.save(courseProgress);
        moduleProgressRepository.deleteByUserIdAndCourseId(userId, courseId);

        log.info("Reset course progress for user {} and course {}", userId, courseId);
    }

    public Integer updateCompletedLessonsCount(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));
        var lessons = lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);

        long completedLessonsCount = lessons.stream()
                .filter(lesson -> lesson.getStatus() == ProgressStatus.COMPLETED)
                .count();

        courseProgress.setCompletedLessonsCount((int) completedLessonsCount);
        courseProgress.setCompletionPercentage((float) completedLessonsCount / courseProgress.getTotalLessonsCount() * 100);

        if (completedLessonsCount == courseProgress.getTotalLessonsCount()) {
            courseProgress.setStatus(ProgressStatus.COMPLETED);
            courseProgress.setCompletionDate(LocalDateTime.now());
        } else if (completedLessonsCount > 0) {
            courseProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }
        courseProgressRepository.save(courseProgress);

        return (int) completedLessonsCount;
    }
}
