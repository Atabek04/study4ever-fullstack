package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.EventHandlingService;
import com.study4ever.progressservice.service.LessonProgressService;
import com.study4ever.progressservice.service.StudyStreakService;
import com.study4ever.progressservice.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventHandlingServiceImpl implements EventHandlingService {

    private final UserProgressService userProgressService;
    private final CourseProgressService courseProgressService;
    private final LessonProgressService lessonProgressService;
    private final StudyStreakService studyStreakService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.user-created}")
    @Transactional
    public void handleUserCreatedEvent(Map<String, Object> userData) {
        String userId = (String) userData.get("userId");
        
        if (userId == null) {
            log.error("Received user created event with null userId");
            return;
        }
        
        log.info("Handling user created event for user ID: {}", userId);
        
        // Initialize user progress
        userProgressService.initializeUserProgress(userId);
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.user-deleted}")
    @Transactional
    public void handleUserDeletedEvent(String userId) {
        if (userId == null) {
            log.error("Received user deleted event with null userId");
            return;
        }
        
        log.info("Handling user deleted event for user ID: {}", userId);
        
        // The actual deletion logic would be implemented here
        // This is typically a soft delete or data anonymization
        // For now, we'll just log the event
        log.info("Would delete or anonymize progress data for user ID: {}", userId);
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.course-enrollment}")
    @Transactional
    public void handleCourseEnrollmentEvent(String userId, String courseId) {
        if (userId == null || courseId == null) {
            log.error("Received course enrollment event with null userId or courseId");
            return;
        }
        
        log.info("Handling course enrollment event for user ID: {} and course ID: {}", userId, courseId);
        
        // Create course progress for the user
        courseProgressService.enrollInCourse(userId, courseId);
        
        // Update user's last active timestamp
        userProgressService.updateLastLoginDate(userId);
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.course-completion}")
    @Transactional
    public void handleCourseCompletionEvent(String userId, String courseId) {
        if (userId == null || courseId == null) {
            log.error("Received course completion event with null userId or courseId");
            return;
        }
        
        log.info("Handling course completion event for user ID: {} and course ID: {}", userId, courseId);
        
        // Mark course as completed
        courseProgressService.markCourseCompleted(userId, courseId);
        
        // Update streak as this is an achievement
        studyStreakService.updateStreak(userId);
    }
    
    // Additional RabbitMQ listeners not defined in the interface
    
    @RabbitListener(queues = "${rabbitmq.queues.lesson-completion}")
    @Transactional
    public void handleLessonCompletionEvent(Map<String, String> eventData) {
        String userId = eventData.get("userId");
        String courseId = eventData.get("courseId");
        String moduleId = eventData.get("moduleId");
        String lessonId = eventData.get("lessonId");
        
        if (userId == null || courseId == null || moduleId == null || lessonId == null) {
            log.error("Received lesson completion event with missing data");
            return;
        }
        
        log.info("Handling lesson completion event for user ID: {} and lesson ID: {}", userId, lessonId);
        
        // Mark lesson as completed
        lessonProgressService.markLessonCompleted(userId, courseId, moduleId, lessonId);
        
        // Update study streak since user has shown activity
        studyStreakService.updateStreak(userId);
    }
    
    @RabbitListener(queues = "${rabbitmq.queues.user-login}")
    @Transactional
    public void handleUserLoginEvent(String userId) {
        if (userId == null) {
            log.error("Received user login event with null userId");
            return;
        }
        
        log.info("Handling user login event for user ID: {}", userId);
        
        // Update user's last active timestamp
        userProgressService.updateLastLoginDate(userId);
    }
}
