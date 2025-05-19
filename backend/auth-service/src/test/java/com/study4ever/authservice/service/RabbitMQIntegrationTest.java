package com.study4ever.authservice.service;

import com.study4ever.authservice.config.RabbitMQTestConfig;
import com.study4ever.authservice.dto.UserCreatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
@Import(RabbitMQTestConfig.class)
class RabbitMQIntegrationTest {

    @Autowired
    private UserEventProducer userEventProducer;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    @Autowired
    private Jackson2JsonMessageConverter messageConverter;

    private UserCreatedEvent userCreatedEvent;
    private static final String USER_QUEUE = "user.queue";

    @BeforeEach
    void setUp() {
        userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(UUID.randomUUID());
        userCreatedEvent.setUsername("testuser");
        userCreatedEvent.setEmail("test@example.com");
        userCreatedEvent.setActive(true);

        // Clear the queue properly using RabbitAdmin
        rabbitAdmin.purgeQueue(USER_QUEUE, true);
    }

    @Test
    void shouldSendAndReceiveUserCreatedEvent() {
        // Given
        userEventProducer.sendUserCreatedEvent(userCreatedEvent);

        // When
        Message receivedMessage = rabbitTemplate.receive(USER_QUEUE, 1000);

        // Then
        assertNotNull(receivedMessage);

        UserCreatedEvent receivedEvent = (UserCreatedEvent) messageConverter.fromMessage(receivedMessage);
        assertNotNull(receivedEvent);
        assertEquals(userCreatedEvent.getId(), receivedEvent.getId());
        assertEquals(userCreatedEvent.getUsername(), receivedEvent.getUsername());
        assertEquals(userCreatedEvent.getEmail(), receivedEvent.getEmail());
        assertEquals(userCreatedEvent.isActive(), receivedEvent.isActive());
    }
}