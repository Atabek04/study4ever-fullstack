package com.study4ever.authservice.integration;

import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import com.study4ever.authservice.dto.UserUpdatedEvent;
import com.study4ever.authservice.service.UserEventProducer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public class RabbitMQE2EIT {

    @Container
    private static final PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("auth_service_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    private static final RabbitMQContainer rabbitMQContainer = new RabbitMQContainer("rabbitmq:3.9-management")
            .withExposedPorts(5672, 15672);

    @Autowired
    private UserEventProducer userEventProducer;

    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @Autowired
    private RabbitAdmin rabbitAdmin;
    
    @Autowired
    private Jackson2JsonMessageConverter messageConverter;

    private static final String USER_QUEUE = "user.queue";
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @BeforeAll
    static void setup() {
        postgresContainer.start();
        rabbitMQContainer.start();
    }

    @AfterAll
    static void cleanup() {
        postgresContainer.stop();
        rabbitMQContainer.stop();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        registry.add("spring.rabbitmq.host", rabbitMQContainer::getHost);
        registry.add("spring.rabbitmq.port", rabbitMQContainer::getAmqpPort);
        registry.add("spring.rabbitmq.username", rabbitMQContainer::getAdminUsername);
        registry.add("spring.rabbitmq.password", rabbitMQContainer::getAdminPassword);
    }

    @Test
    void shouldSendUserCreatedEvent() {
        // Given
        UserCreatedEvent userCreatedEvent = createUserCreatedEvent();
        
        // Clear the queue first
        rabbitAdmin.purgeQueue(USER_QUEUE);
        
        // When
        userEventProducer.sendUserCreatedEvent(userCreatedEvent);
        
        // Then
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            Message message = rabbitTemplate.receive(USER_QUEUE, 1000);
            assertNotNull(message, "Message should not be null");

            UserCreatedEvent receivedEvent = (UserCreatedEvent) messageConverter.fromMessage(message);
            assertEquals(userCreatedEvent.getId(), receivedEvent.getId());
            assertEquals(userCreatedEvent.getUsername(), receivedEvent.getUsername());
            assertEquals(userCreatedEvent.getEmail(), receivedEvent.getEmail());
            assertEquals(userCreatedEvent.isActive(), receivedEvent.isActive());
        });
    }

    @Test
    void shouldSendUserUpdatedEvent() {
        // Given
        UserUpdatedEvent userUpdatedEvent = createUserUpdatedEvent();
        
        // Clear the queue first
        rabbitAdmin.purgeQueue(USER_QUEUE);
        
        // When
        userEventProducer.sendUserUpdatedEvent(userUpdatedEvent);
        
        // Then
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            Message message = rabbitTemplate.receive(USER_QUEUE, 1000);
            assertNotNull(message, "Message should not be null");

            UserUpdatedEvent receivedEvent = (UserUpdatedEvent) messageConverter.fromMessage(message);
            assertEquals(userUpdatedEvent.getId(), receivedEvent.getId());
            assertEquals(userUpdatedEvent.getUsername(), receivedEvent.getUsername());
            assertEquals(userUpdatedEvent.getEmail(), receivedEvent.getEmail());
            assertEquals(userUpdatedEvent.isActive(), receivedEvent.isActive());
        });
    }

    @Test
    void shouldSendUserDeletedEvent() {
        // Given
        UserDeletedEvent userDeletedEvent = createUserDeletedEvent();
        
        // Clear the queue first
        rabbitAdmin.purgeQueue(USER_QUEUE);
        
        // When
        userEventProducer.sendUserDeletedEvent(userDeletedEvent);
        
        // Then
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            Message message = rabbitTemplate.receive(USER_QUEUE, 1000);
            assertNotNull(message, "Message should not be null");

            UserDeletedEvent receivedEvent = (UserDeletedEvent) messageConverter.fromMessage(message);
            assertEquals(userDeletedEvent.getId(), receivedEvent.getId());
        });
    }

    private UserCreatedEvent createUserCreatedEvent() {
        UserCreatedEvent event = new UserCreatedEvent();
        event.setId(TEST_USER_ID);
        event.setUsername("e2e-test-user");
        event.setEmail("e2e@test.com");
        event.setActive(true);
        return event;
    }

    private UserUpdatedEvent createUserUpdatedEvent() {
        UserUpdatedEvent event = new UserUpdatedEvent();
        event.setId(TEST_USER_ID);
        event.setUsername("updated-e2e-user");
        event.setEmail("updated-e2e@test.com");
        event.setActive(true);
        return event;
    }

    private UserDeletedEvent createUserDeletedEvent() {
        UserDeletedEvent event = new UserDeletedEvent();
        event.setId(TEST_USER_ID);
        return event;
    }
}