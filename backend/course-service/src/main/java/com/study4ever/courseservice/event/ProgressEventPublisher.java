package com.study4ever.courseservice.event;

import java.time.LocalDateTime;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.study4ever.courseservice.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProgressEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publishes an event that a lesson has been completed by a user.
     * 
     * @param userId    The ID of the user who completed the lesson
     * @param courseId  The ID of the course containing the lesson
     * @param moduleId  The ID of the module containing the lesson
     * @param lessonId  The ID of the completed lesson
     */
    public void publishLessonCompleted(String userId, String courseId, String moduleId, String lessonId) {
        log.info("Publishing lesson completion event: userId={}, courseId={}, lessonId={}", 
                userId, courseId, lessonId);
        
        LessonCompletionEvent event = LessonCompletionEvent.builder()
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .lessonId(lessonId)
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EVENTS_EXCHANGE,
            RabbitMQConfig.LESSON_COMPLETION_ROUTING_KEY, 
            event
        );
    }
    
    /**
     * Publishes an event that a module has been completed by a user.
     * 
     * @param userId    The ID of the user who completed the module
     * @param courseId  The ID of the course containing the module
     * @param moduleId  The ID of the completed module
     */
    public void publishModuleCompleted(String userId, String courseId, String moduleId) {
        log.info("Publishing module completion event: userId={}, courseId={}, moduleId={}", 
                userId, courseId, moduleId);
        
        ModuleCompletionEvent event = ModuleCompletionEvent.builder()
                .userId(userId)
                .courseId(courseId)
                .moduleId(moduleId)
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EVENTS_EXCHANGE,
            RabbitMQConfig.MODULE_COMPLETION_ROUTING_KEY, 
            event
        );
    }
    
    /**
     * Publishes an event that a course has been completed by a user.
     * 
     * @param userId    The ID of the user who completed the course
     * @param courseId  The ID of the completed course
     */
    public void publishCourseCompleted(String userId, String courseId) {
        log.info("Publishing course completion event: userId={}, courseId={}", 
                userId, courseId);
        
        CourseCompletionEvent event = CourseCompletionEvent.builder()
                .userId(userId)
                .courseId(courseId)
                .timestamp(LocalDateTime.now())
                .build();
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EVENTS_EXCHANGE,
            RabbitMQConfig.COURSE_COMPLETION_ROUTING_KEY, 
            event
        );
    }
}
