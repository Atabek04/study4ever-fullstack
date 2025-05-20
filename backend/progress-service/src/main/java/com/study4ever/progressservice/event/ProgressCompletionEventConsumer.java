package com.study4ever.progressservice.event;

import com.study4ever.progressservice.event.message.CourseCompletionEvent;
import com.study4ever.progressservice.event.message.LessonCompletionEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.LessonProgressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProgressCompletionEventConsumer {

    private final CourseProgressService courseProgressService;
    private final LessonProgressService lessonProgressService;

    @RabbitListener(queues = "${rabbitmq.queues.lesson-completion}")
    @Transactional
    public void handleLessonCompletion(LessonCompletionEvent event) {
        log.info("Received lesson completion event: userId={}, courseId={}, moduleId={}, lessonId={}", 
                event.getUserId(), event.getCourseId(), event.getModuleId(), event.getLessonId());
        
        try {
            lessonProgressService.markLessonCompleted(
                event.getUserId(), 
                event.getCourseId(), 
                event.getModuleId(), 
                event.getLessonId()
            );
            
            log.info("Successfully processed lesson completion for userId={}, lessonId={}", 
                    event.getUserId(), event.getLessonId());
        } catch (Exception e) {
            log.error("Error processing lesson completion event: {}", e.getMessage(), e);
        }
    }
    
    @RabbitListener(queues = "${rabbitmq.queues.course-completion}")
    @Transactional
    public void handleCourseCompletion(CourseCompletionEvent event) {
        log.info("Received course completion event: userId={}, courseId={}", 
                event.getUserId(), event.getCourseId());
        
        try {
            courseProgressService.markCourseCompleted(
                event.getUserId(),
                event.getCourseId()
            );
            
            log.info("Successfully processed course completion for userId={}, courseId={}", 
                    event.getUserId(), event.getCourseId());
        } catch (Exception e) {
            log.error("Error processing course completion event: {}", e.getMessage(), e);
        }
    }
}
