package com.study4ever.courseservice.event;

import com.study4ever.courseservice.event.message.StudySessionEndedEvent;
import com.study4ever.courseservice.event.message.StudySessionHeartbeatEvent;
import com.study4ever.courseservice.event.message.StudySessionStartedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.study4ever.courseservice.config.RabbitMQConfig;
import com.study4ever.courseservice.service.ActiveStudySessionPersistenceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ActiveStudySessionPersistenceService sessionService;

    /**
     * Publishes an event that a study session has started.
     * Before publishing, checks if the user already has an active session.
     * 
     * @param event The study session started event.
     */
    public void publishStudySessionStarted(StudySessionStartedEvent event) {
        // First check if the user already has an active session
        if (sessionService.hasActiveSession(event.getUserId())) {
            log.info("User {} already has an active study session. Skipping event publication.", 
                    event.getUserId());
            return;
        }
        
        log.info("Publishing study session started event: userId={}, courseId={}", 
                event.getUserId(), event.getCourseId());
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.STUDY_SESSION_EXCHANGE,
            RabbitMQConfig.STUDY_SESSION_STARTED_ROUTING_KEY, 
            event
        );
    }

    /**
     * Publishes an event that a study session has ended.
     * 
     * @param event The study session ended event.
     */
    public void publishStudySessionEnded(StudySessionEndedEvent event) {
        log.info("Publishing study session ended event: userId={}, sessionId={}", 
                event.getUserId(), event.getSessionId());
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.STUDY_SESSION_EXCHANGE,
            RabbitMQConfig.STUDY_SESSION_ENDED_ROUTING_KEY, 
            event
        );
    }

    /**
     * Publishes a heartbeat event for an active study session.
     * 
     * @param event The study session heartbeat event.
     */
    public void publishStudySessionHeartbeat(StudySessionHeartbeatEvent event) {
        log.debug("Publishing study session heartbeat event: userId={}, sessionId={}", 
                event.getUserId(), event.getSessionId());
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.STUDY_SESSION_EXCHANGE,
            RabbitMQConfig.STUDY_SESSION_HEARTBEAT_ROUTING_KEY, 
            event
        );
    }
}
