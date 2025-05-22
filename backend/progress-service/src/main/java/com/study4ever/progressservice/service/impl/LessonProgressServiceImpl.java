package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.exception.BadRequestException;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.LessonProgress;
import com.study4ever.progressservice.model.ModuleProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.LessonProgressRepository;
import com.study4ever.progressservice.repository.ModuleProgressRepository;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.LessonProgressService;
import com.study4ever.progressservice.service.ModuleProgressService;
import com.study4ever.progressservice.service.StudyStreakService;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressServiceImpl implements LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final CourseProgressService courseProgressService;
    private final ModuleProgressService moduleProgressService;
    private final UserProgressService userProgressService;
    private final StudyStreakService studyStreakService;

    @Override
    public LessonProgressDto getLessonProgress(String userId, String courseId, String moduleId, String lessonId) {
        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);

        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId)
                .map(ProgressMapper::mapToLessonDto)
                .orElseThrow(() -> new NotFoundException("Lesson progress not found for user " + userId + " and lesson " + lessonId));
    }

    @Override
    @Transactional
    public LessonProgressDto initializeLessonProgress(String userId, String courseId, String moduleId, String lessonId) {
        var existingProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId);
        if (existingProgress.isPresent()) {
            throw new BadRequestException("Lesson progress already exist for user " + userId + " and lesson " + lessonId);
        }

        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);

        var lessonProgress = LessonProgress.builder()
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .lessonId(lessonId)
                .status(ProgressStatus.NOT_STARTED)
                .firstAccessDate(LocalDateTime.now())
                .lastAccessDate(LocalDateTime.now())
                .build();

        var savedProgress = lessonProgressRepository.save(lessonProgress);
        log.info("Initialized lesson progress for user {} and lesson {}", userId, lessonId);

        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);

        return ProgressMapper.mapToLessonDto(savedProgress);
    }

    @Override
    public List<LessonProgressDto> getAllLessonsProgressInModule(String userId, String courseId, String moduleId) {
        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);
        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId).stream()
                .map(ProgressMapper::mapToLessonDto)
                .toList();
    }

    @Override
    @Transactional
    public void markLessonCompleted(String userId, String courseId, String moduleId, String lessonId) {
        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);

        LessonProgress lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId)
                .orElseThrow(() -> new NotFoundException("Lesson progress not found for user " + userId + " and module " + moduleId));


        lessonProgress.setStatus(ProgressStatus.COMPLETED);
        lessonProgress.setCompletionDate(LocalDateTime.now());
        lessonProgressRepository.save(lessonProgress);

        userProgressService.increaseCompletedLessonsCount(userId);

        var courseProgress = courseProgressRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        courseProgress.setCurrentLessonId(lessonId);
        courseProgress.setCurrentModuleId(moduleId);
        courseProgressRepository.save(courseProgress);

        updateCompletionProgress(userId, courseId, moduleId);
        studyStreakService.updateLastStudyDateToday(userId);

        log.info("Marked lesson {} as completed for user {}", lessonId, userId);
    }

    @Override
    @Transactional
    public void updateLastAccessed(String userId, String courseId, String moduleId, String lessonId) {
        var lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId)
                .orElseThrow(() -> new NotFoundException("Lesson progress not found for user " + userId + " and lesson " + lessonId));

        lessonProgress.setLastAccessDate(LocalDateTime.now());

        if (lessonProgress.getStatus() == ProgressStatus.NOT_STARTED) {
            lessonProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }

        lessonProgressRepository.save(lessonProgress);
        moduleProgressService.updateLastAccessed(userId, courseId, moduleId);

        log.debug("Updated last access time for user {} and lesson {}", userId, lessonId);
    }

    @Override
    public void deleteLessonProgress(String userId, String courseId, String moduleId, String lessonId) {
        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);

        var lessonProgress = lessonProgressRepository
                .findByUserIdAndCourseIdAndModuleIdAndLessonId(userId, courseId, moduleId, lessonId)
                .orElseThrow(() -> new NotFoundException("Lesson progress not found for user " + userId + " and lesson " + lessonId));

        lessonProgressRepository.delete(lessonProgress);
        log.info("Deleted lesson progress for user {} and lesson {}", userId, lessonId);
    }

    @Override
    public List<String> getCompletedLessons(String userId, String courseId, String moduleId) {
        checkCourseProgressExists(userId, courseId);
        checkModuleProgressExists(userId, courseId, moduleId);

        return lessonProgressRepository.findByUserIdAndCourseIdAndModuleIdAndStatus(userId, courseId, moduleId, ProgressStatus.COMPLETED)
                .stream()
                .map(LessonProgress::getLessonId)
                .toList();
    }

    @Override
    public List<String> getCompletedLessonsInCourse(String userId, String courseId) {
        checkCourseProgressExists(userId, courseId);

        return lessonProgressRepository.findByUserIdAndCourseIdAndStatus(userId, courseId, ProgressStatus.COMPLETED)
                .stream()
                .map(LessonProgress::getLessonId)
                .toList();
    }

    private void updateCompletionProgress(String userId, String courseId, String moduleId) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId)
                .orElseThrow(() -> new NotFoundException("Module progress not found for user " + userId + " and module " + moduleId));

        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new NotFoundException("Course progress not found for user " + userId + " and course " + courseId));

        List<LessonProgress> moduleLessons = lessonProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);

        if (moduleProgress.getTotalLessonsCount() <= 0 || courseProgress.getTotalLessonsCount() <= 0) {
            log.debug("Skipping progress update - no lessons to track for module {} or course {}", moduleId, courseId);
            return;
        }

        updateModuleProgress(moduleLessons, moduleProgress);
        updateCourseProgress(userId, courseId, courseProgress);

        log.debug("Updated module progress for user {} and module {}: {}%",
                userId, moduleId, moduleProgress.getCompletionPercentage());
    }

    private void updateModuleProgress(List<LessonProgress> moduleLessons, ModuleProgress moduleProgress) {
        int totalLessons = moduleProgress.getTotalLessonsCount();
        long completedLessons = moduleLessons.stream()
                .filter(lesson -> lesson.getStatus() == ProgressStatus.COMPLETED)
                .count();

        float completionPercentage = ((float) completedLessons / totalLessons) * 100;
        moduleProgress.setCompletionPercentage(completionPercentage);

        updateModuleStatus(moduleProgress, completedLessons, totalLessons);

        moduleProgressRepository.save(moduleProgress);
    }

    private void updateCourseProgress(String userId, String courseId, CourseProgress courseProgress) {
        int totalLessons = courseProgress.getTotalLessonsCount();
        long completedLessons = courseProgressService.updateCompletedLessonsCount(userId, courseId);

        float completionPercentage = ((float) completedLessons / totalLessons) * 100;
        courseProgress.setCompletionPercentage(completionPercentage);

        if (completedLessons == totalLessons) {
            courseProgressService.markCourseCompleted(userId, courseId);
        }

        courseProgressRepository.save(courseProgress);
        courseProgressService.updateLastAccessed(userId, courseId);
    }

    private void updateModuleStatus(ModuleProgress moduleProgress,
                                    long completedLessons, int totalLessons) {
        if (completedLessons == totalLessons) {
            moduleProgress.setStatus(ProgressStatus.COMPLETED);
            moduleProgress.setCompletionDate(LocalDateTime.now());

            userProgressService.increaseCompletedModulesCount(moduleProgress.getUserId());
        } else if (completedLessons > 0) {
            moduleProgress.setStatus(ProgressStatus.IN_PROGRESS);
        }
    }

    private void checkModuleProgressExists(String userId, String courseId, String moduleId) {
        var moduleProgress = moduleProgressRepository.findByUserIdAndCourseIdAndModuleId(userId, courseId, moduleId);
        if (moduleProgress.isEmpty()) {
            throw new NotFoundException("Module progress not found for user " + userId + " and module " + moduleId);
        }
    }

    private void checkCourseProgressExists(String userId, String courseId) {
        var courseProgress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (courseProgress.isEmpty()) {
            throw new NotFoundException("Course progress not found for user " + userId + " and course " + courseId);
        }
    }

}
