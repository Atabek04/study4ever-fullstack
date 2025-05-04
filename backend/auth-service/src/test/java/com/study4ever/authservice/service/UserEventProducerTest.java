package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import com.study4ever.authservice.dto.UserUpdatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.Mockito.verify;

import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class UserEventProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private UserEventProducer userEventProducer;

    private UserCreatedEvent userCreatedEvent;
    private UserUpdatedEvent userUpdatedEvent;
    private UserDeletedEvent userDeletedEvent;
    private static final String USER_QUEUE = "user.queue";

    @BeforeEach
    void setUp() {
        userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(UUID.randomUUID());
        userCreatedEvent.setUsername("testuser");
        userCreatedEvent.setEmail("test@example.com");
        userCreatedEvent.setActive(true);

        userUpdatedEvent = new UserUpdatedEvent();
        userUpdatedEvent.setId(UUID.randomUUID());
        userUpdatedEvent.setUsername("updateduser");
        userUpdatedEvent.setEmail("updated@example.com");
        userUpdatedEvent.setActive(true);

        userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(UUID.randomUUID());
    }

    @Test
    void sendUserCreatedEvent_ShouldSendEventToQueue() {
        // When
        userEventProducer.sendUserCreatedEvent(userCreatedEvent);

        // Then
        verify(rabbitTemplate).convertAndSend(USER_QUEUE, userCreatedEvent);
    }

    @Test
    void sendUserUpdatedEvent_ShouldSendEventToQueue() {
        // When
        userEventProducer.sendUserUpdatedEvent(userUpdatedEvent);

        // Then
        verify(rabbitTemplate).convertAndSend(USER_QUEUE, userUpdatedEvent);
    }

    @Test
    void sendUserDeletedEvent_ShouldSendEventToQueue() {
        // When
        userEventProducer.sendUserDeletedEvent(userDeletedEvent);

        // Then
        verify(rabbitTemplate).convertAndSend(USER_QUEUE, userDeletedEvent);
    }
}