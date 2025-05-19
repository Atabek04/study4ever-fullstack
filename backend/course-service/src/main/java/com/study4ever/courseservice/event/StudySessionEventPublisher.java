package com.study4ever.courseservice.event;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.study4ever.courseservice.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudySessionEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publishes an event that a study session has started.
     * 
     * @param event The study session started event.
     */
    public void publishStudySessionStarted(StudySessionStartedEvent event) {
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
