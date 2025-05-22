package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.LessonProgressDto;

import java.util.List;

public interface LessonProgressService {

    LessonProgressDto getLessonProgress(String userId, String courseId, String moduleId, String lessonId);

    LessonProgressDto initializeLessonProgress(String userId, String courseId, String moduleId, String lessonId);

    List<LessonProgressDto> getAllLessonsProgressInModule(String userId, String courseId, String moduleId);

    void markLessonCompleted(String userId, String courseId, String moduleId, String lessonId);

    void updateLastAccessed(String userId, String courseId, String moduleId, String lessonId);

    void deleteLessonProgress(String userId, String courseId, String moduleId, String lessonId);

    List<String> getCompletedLessons(String userId, String courseId, String moduleId);

    List<String> getCompletedLessonsInCourse(String userId, String courseId);
}
