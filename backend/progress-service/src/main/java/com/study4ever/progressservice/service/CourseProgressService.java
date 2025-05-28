package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.CourseEnrollmentRequest;
import com.study4ever.progressservice.dto.CourseProgressDto;
import com.study4ever.progressservice.dto.NextLessonDto;

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
    
    /**
     * Find the next lesson a user should continue with in a course.
     * If the user has completed lessons, it returns the first uncompleted lesson.
     * If all lessons are completed, it returns the last lesson in the course.
     * If no lessons are completed, it returns the first lesson in the course.
     *
     * @param userId   The user's ID
     * @param courseId The course ID
     * @return NextLessonDto containing the next lesson information
     */
    NextLessonDto getNextLesson(String userId, String courseId);
}
