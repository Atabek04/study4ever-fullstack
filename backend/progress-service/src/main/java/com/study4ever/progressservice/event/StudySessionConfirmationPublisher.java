package com.study4ever.progressservice.event;

import com.study4ever.progressservice.event.message.StudySessionConfirmationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StudySessionConfirmationPublisher {
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.study-sessions}")
    private String exchange;
    
    @Value("${rabbitmq.routing-keys.study-session-confirmation}")
    private String routingKey;

    public void publishConfirmation(StudySessionConfirmationEvent event) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
}
