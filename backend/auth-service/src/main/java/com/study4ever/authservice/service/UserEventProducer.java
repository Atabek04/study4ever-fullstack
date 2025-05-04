package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserUpdatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserCreatedEvent(UserCreatedEvent event) {
        rabbitTemplate.convertAndSend("user.queue", event);
    }

    public void sendUserUpdatedEvent(UserUpdatedEvent event) {
        rabbitTemplate.convertAndSend("user.queue", event);
    }

    public void sendUserDeletedEvent(UserDeletedEvent event) {
        rabbitTemplate.convertAndSend("user.queue", event);
    }
}