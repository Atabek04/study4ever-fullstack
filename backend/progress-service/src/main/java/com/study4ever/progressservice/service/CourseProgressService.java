package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.ModuleProgressDto;

import java.util.List;

public interface CourseProgressService {

    CourseProgressDto getCourseProgress(String userId, String courseId);

    CourseProgressDto initializeProgress(String userId, String courseId, CourseEnrollmentRequest request);

    List<CourseProgressDto> getAllCourseProgress(String userId);

    List<ModuleProgressDto> getAllModulesProgressInCourse(String userId, String courseId);

    void updateLastAccessed(String userId, String courseId);

    void markCourseCompleted(String userId, String courseId);

    void resetCourseProgress(String userId, String courseId);

    Integer updateCompletedLessonsCount(String userId, String courseId);
}
