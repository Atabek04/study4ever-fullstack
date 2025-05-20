package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;

import java.util.List;

public interface CourseProgressService {

    CourseProgressDto getCourseProgress(String userId, String courseId);

    void enrollInCourse(String userId, String courseId, CourseEnrollmentRequest request);

    List<CourseProgressDto> getAllCourseProgress(String userId);

    void updateLastAccessed(String userId, String courseId);

    void markCourseCompleted(String userId, String courseId);

    void resetCourseProgress(String userId, String courseId);

    Integer updateCompletedLessonsCount(String userId, String courseId);

    void removeEnrolledCourse(String userId, String courseId);
}
