package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserUpdatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserCreatedEvent(UserCreatedEvent event) {
        log.info("Sending UserCreated event: {}", event);
        rabbitTemplate.convertAndSend("user.queue", event);
    }

    public void sendUserUpdatedEvent(UserUpdatedEvent event) {
        log.info("Sending user updated event: {}", event);
        rabbitTemplate.convertAndSend("user.queue", event);
    }

    public void sendUserDeletedEvent(UserDeletedEvent event) {
        log.info("Sending user deleted event: {}", event);
        rabbitTemplate.convertAndSend("user.queue", event);
    }
}