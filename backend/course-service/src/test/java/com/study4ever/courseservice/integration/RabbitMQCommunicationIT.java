package com.study4ever.courseservice.integration;

import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.model.Role;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.lifecycle.Startables;

import java.time.Duration;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public class RabbitMQCommunicationIT {

    // Use static containers with proper lifecycle management
    private static final PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("course_service_test")
            .withUsername("test")
            .withPassword("test");

    private static final RabbitMQContainer rabbitMQContainer = new RabbitMQContainer("rabbitmq:3.9-management")
            .withExposedPorts(5672, 15672);

    // Start all containers in parallel
    static {
        Startables.deepStart(Stream.of(postgresContainer, rabbitMQContainer)).join();
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public ConnectionFactory testConnectionFactory() {
            CachingConnectionFactory factory = new CachingConnectionFactory();
            factory.setHost(rabbitMQContainer.getHost());
            factory.setPort(rabbitMQContainer.getAmqpPort());
            factory.setUsername(rabbitMQContainer.getAdminUsername());
            factory.setPassword(rabbitMQContainer.getAdminPassword());
            return factory;
        }

        @Bean
        @Primary
        public RabbitTemplate testRabbitTemplate(ConnectionFactory connectionFactory) {
            RabbitTemplate template = new RabbitTemplate(connectionFactory);
            template.setMessageConverter(new Jackson2JsonMessageConverter());
            return template;
        }
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private UserReferenceRepository userReferenceRepository;

    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String QUEUE_NAME = "user.queue";
    
    @BeforeEach
    void cleanDatabase() {
        userReferenceRepository.deleteById(TEST_USER_ID);
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
    void simulateAuthServiceCreatingUserAndCourseServiceConsumingEvent() {
        // Given - Create event like auth-service would do
        UserCreatedEvent userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(TEST_USER_ID);
        userCreatedEvent.setUsername("communication-test-user");
        userCreatedEvent.setEmail("communication@test.com");
        userCreatedEvent.setActive(true);
        
        // Add roles to the event
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_STUDENT");
        userCreatedEvent.setRoles(roles);

        // When - Simulate auth-service sending message to queue
        rabbitTemplate.convertAndSend(QUEUE_NAME, userCreatedEvent);

        // Then - Verify course-service consumer processed the event
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Optional<UserReference> userOpt = userReferenceRepository.findById(TEST_USER_ID);
            assertTrue(userOpt.isPresent(), "User should be created in course-service");
            
            UserReference user = userOpt.get();
            assertEquals(userCreatedEvent.getUsername(), user.getUsername());
            assertEquals(userCreatedEvent.getEmail(), user.getEmail());
            assertEquals(userCreatedEvent.isActive(), user.getActive());
            assertTrue(user.getRoles().contains(Role.ROLE_STUDENT), "User should have ROLE_STUDENT role");
        });
    }

    @Test
    void simulateAuthServiceUpdatingUserAndCourseServiceConsumingEvent() {
        // Given - Create initial user
        UserReference initialUser = new UserReference();
        initialUser.setId(TEST_USER_ID);
        initialUser.setUsername("initial-user");
        initialUser.setEmail("initial@test.com");
        initialUser.setActive(true);
        initialUser.setRoles(Set.of(Role.ROLE_STUDENT));
        userReferenceRepository.save(initialUser);

        // Create update event like auth-service would do
        UserUpdatedEvent userUpdatedEvent = new UserUpdatedEvent();
        userUpdatedEvent.setId(TEST_USER_ID);
        userUpdatedEvent.setUsername("communication-updated-user");
        userUpdatedEvent.setEmail("updated-communication@test.com");
        userUpdatedEvent.setActive(true);
        
        // Update roles to include both STUDENT and INSTRUCTOR roles
        Set<String> updatedRoles = new HashSet<>();
        updatedRoles.add("ROLE_STUDENT");
        updatedRoles.add("ROLE_INSTRUCTOR");
        userUpdatedEvent.setRoles(updatedRoles);

        // When - Simulate auth-service sending message to queue
        rabbitTemplate.convertAndSend(QUEUE_NAME, userUpdatedEvent);

        // Then - Verify course-service consumer processed the event
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Optional<UserReference> userOpt = userReferenceRepository.findById(TEST_USER_ID);
            assertTrue(userOpt.isPresent(), "User should exist in course-service");
            
            UserReference user = userOpt.get();
            assertEquals(userUpdatedEvent.getUsername(), user.getUsername());
            assertEquals(userUpdatedEvent.getEmail(), user.getEmail());
            assertEquals(userUpdatedEvent.isActive(), user.getActive());
            assertEquals(2, user.getRoles().size(), "User should have 2 roles");
            assertTrue(user.getRoles().contains(Role.ROLE_STUDENT), "User should have ROLE_STUDENT role");
            assertTrue(user.getRoles().contains(Role.ROLE_INSTRUCTOR), "User should have ROLE_INSTRUCTOR role");
        });
    }

    @Test
    void simulateAuthServiceDeletingUserAndCourseServiceConsumingEvent() {
        // Given - Create initial user
        UserReference userToDelete = new UserReference();
        userToDelete.setId(TEST_USER_ID);
        userToDelete.setUsername("user-to-delete");
        userToDelete.setEmail("delete@test.com");
        userToDelete.setActive(true);
        userToDelete.setRoles(Set.of(Role.ROLE_STUDENT));
        userReferenceRepository.save(userToDelete);
        
        // Verify user exists initially
        assertTrue(userReferenceRepository.existsById(TEST_USER_ID));

        // Create delete event like auth-service would do
        UserDeletedEvent userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(TEST_USER_ID);

        // When - Simulate auth-service sending message to queue
        rabbitTemplate.convertAndSend(QUEUE_NAME, userDeletedEvent);

        // Then - Verify course-service consumer processed the delete event
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            assertFalse(userReferenceRepository.existsById(TEST_USER_ID), 
                "User should be deleted from course-service");
        });
    }
}