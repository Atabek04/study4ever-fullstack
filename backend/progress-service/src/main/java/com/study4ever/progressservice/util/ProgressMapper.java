package com.study4ever.progressservice.util;

import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.LessonProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;
import com.study4ever.progressservice.dto.StudySessionDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.LessonProgress;
import com.study4ever.progressservice.model.ModuleProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.model.StudyStreak;
import com.study4ever.progressservice.model.UserProgress;

import static com.study4ever.progressservice.model.ProgressStatus.COMPLETED;
import static com.study4ever.progressservice.model.ProgressStatus.IN_PROGRESS;
import static com.study4ever.progressservice.model.ProgressStatus.NOT_STARTED;

/**
 * Utility class for mapping between entity and DTO objects in the progress service.
 * This centralizes the mapping logic for better maintainability.
 */
public class ProgressMapper {

    /**
     * Maps ProgressStatus entity to ProgressStatusDto
     */
    public static ProgressStatus mapStatus(ProgressStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case NOT_STARTED -> NOT_STARTED;
            case IN_PROGRESS -> IN_PROGRESS;
            case COMPLETED -> COMPLETED;
        };
    }

    /**
     * Maps CourseProgress entity to CourseProgressDto
     */
    public static CourseProgressDto mapToCourseDto(CourseProgress entity) {
        if (entity == null) {
            return null;
        }

        return CourseProgressDto.builder()
                .progressId(entity.getId())
                .userId(entity.getUserId())
                .courseId(entity.getCourseId())
                .status(mapStatus(entity.getStatus()))
                .completionPercentage(entity.getCompletionPercentage())
                .currentModuleId(entity.getCurrentModuleId())
                .currentLessonId(entity.getCurrentLessonId())
                .enrollmentDate(entity.getEnrollmentDate())
                .lastAccessDate(entity.getLastAccessDate())
                .completedLessonsCount(entity.getCompletedLessonsCount())
                .totalLessonsCount(entity.getTotalLessonsCount())
                .totalModulesCount(entity.getTotalModulesCount())
                .build();
    }

    /**
     * Maps ModuleProgress entity to ModuleProgressDto
     */
    public static ModuleProgressDto mapToModuleDto(ModuleProgress entity) {
        if (entity == null) {
            return null;
        }

        return ModuleProgressDto.builder()
                .progressId(entity.getId())
                .userId(entity.getUserId())
                .courseId(entity.getCourseId())
                .moduleId(entity.getModuleId())
                .status(mapStatus(entity.getStatus()))
                .completionPercentage(entity.getCompletionPercentage())
                .firstAccessDate(entity.getFirstAccessDate())
                .lastAccessDate(entity.getLastAccessDate())
                .completionDate(entity.getCompletionDate())
                .totalLessonsCount(entity.getTotalLessonsCount())
                .build();
    }

    /**
     * Maps LessonProgress entity to LessonProgressDto
     */
    public static LessonProgressDto mapToLessonDto(LessonProgress entity) {
        if (entity == null) {
            return null;
        }

        return LessonProgressDto.builder()
                .progressId(entity.getId())
                .userId(entity.getUserId())
                .courseId(entity.getCourseId())
                .moduleId(entity.getModuleId())
                .lessonId(entity.getLessonId())
                .status(mapStatus(entity.getStatus()))
                .firstAccessDate(entity.getFirstAccessDate())
                .lastAccessDate(entity.getLastAccessDate())
                .completionDate(entity.getCompletionDate())
                .build();
    }

    /**
     * Maps StudySession entity to StudySessionDto
     */
    public static StudySessionDto mapToSessionDto(StudySession session) {
        if (session == null) {
            return null;
        }

        return StudySessionDto.builder()
                .sessionId(session.getId())
                .userId(session.getUserId())
                .courseId(session.getCourseId())
                .moduleId(session.getModuleId())
                .lessonId(session.getLessonId())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationMinutes(session.getDurationMinutes())
                .active(session.getActive())
                .build();
    }

    /**
     * Maps UserProgress entity and StudyStreak to UserProgressDto
     */
    public static UserProgressDto mapToUserDto(UserProgress userProgress, StudyStreak streak) {
        if (userProgress == null) {
            return null;
        }

        return UserProgressDto.builder()
                .userId(userProgress.getUserId())
                .totalCompletedLessons(userProgress.getTotalCompletedLessons())
                .totalCompletedModules(userProgress.getTotalCompletedModules())
                .totalCompletedCourses(userProgress.getTotalCompletedCourses())
                .totalStudyTimeMinutes(userProgress.getTotalStudyTimeMinutes())
                .lastActiveTimestamp(userProgress.getLastActiveTimestamp())
                .registrationDate(userProgress.getRegistrationDate())
                .currentStreak(streak != null ? streak.getCurrentStreakDays() : 0)
                .longestStreak(streak != null ? streak.getLongestStreakDays() : 0)
                .build();
    }

}
