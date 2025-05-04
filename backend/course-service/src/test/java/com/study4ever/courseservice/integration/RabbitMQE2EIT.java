package com.study4ever.courseservice.integration;

import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.lifecycle.Startables;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public class RabbitMQE2EIT {

    // Use static containers with proper lifecycle management
    private static final PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("course_service_test")
            .withUsername("test")
            .withPassword("test");

    private static final RabbitMQContainer rabbitMQContainer = new RabbitMQContainer("rabbitmq:3.9-management")
            .withExposedPorts(5672, 15672);

    private static final UUID TEST_USER_ID = UUID.randomUUID();

    // Start all containers in parallel
    static {
        Startables.deepStart(Stream.of(postgresContainer, rabbitMQContainer)).join();
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private UserReferenceRepository userReferenceRepository;

    @BeforeEach
    void cleanDatabase() {
        userReferenceRepository.deleteAll();
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
    void shouldHandleUserCreationEvent() {
        // Given
        UserCreatedEvent userCreatedEvent = createUserCreatedEvent();

        // When
        rabbitTemplate.convertAndSend("user.queue", userCreatedEvent);

        // Then
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Optional<UserReference> userOpt = userReferenceRepository.findById(TEST_USER_ID);
            assertTrue(userOpt.isPresent());
            UserReference user = userOpt.get();
            assertEquals(userCreatedEvent.getUsername(), user.getUsername());
            assertEquals(userCreatedEvent.getEmail(), user.getEmail());
            assertEquals(userCreatedEvent.isActive(), user.getActive());
        });
    }

    @Test
    void shouldHandleUserUpdateEvent() {
        // Given
        // First create a user
        createAndSaveUserReference();
        
        // Then create update event
        UserUpdatedEvent userUpdatedEvent = new UserUpdatedEvent();
        userUpdatedEvent.setId(TEST_USER_ID);
        userUpdatedEvent.setUsername("updated-e2e-user");
        userUpdatedEvent.setEmail("updated-e2e@test.com");
        userUpdatedEvent.setActive(true);

        // When
        rabbitTemplate.convertAndSend("user.queue", userUpdatedEvent);

        // Then
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Optional<UserReference> userOpt = userReferenceRepository.findById(TEST_USER_ID);
            assertTrue(userOpt.isPresent());
            UserReference user = userOpt.get();
            assertEquals(userUpdatedEvent.getUsername(), user.getUsername());
            assertEquals(userUpdatedEvent.getEmail(), user.getEmail());
            assertEquals(userUpdatedEvent.isActive(), user.getActive());
        });
    }

    @Test
    void shouldHandleUserDeleteEvent() {
        // Given
        // First create a user
        createAndSaveUserReference();
        
        // Then create delete event
        UserDeletedEvent userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(TEST_USER_ID);

        // When
        rabbitTemplate.convertAndSend("user.queue", userDeletedEvent);

        // Then
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Optional<UserReference> userOpt = userReferenceRepository.findById(TEST_USER_ID);
            assertFalse(userOpt.isPresent());
        });
    }

    private UserCreatedEvent createUserCreatedEvent() {
        UserCreatedEvent userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(TEST_USER_ID);
        userCreatedEvent.setUsername("e2e-test-user");
        userCreatedEvent.setEmail("e2e@test.com");
        userCreatedEvent.setActive(true);
        return userCreatedEvent;
    }

    private UserReference createAndSaveUserReference() {
        UserReference userReference = new UserReference();
        userReference.setId(TEST_USER_ID);
        userReference.setUsername("original-e2e-user");
        userReference.setEmail("original-e2e@test.com");
        userReference.setActive(true);
        return userReferenceRepository.save(userReference);
    }
}