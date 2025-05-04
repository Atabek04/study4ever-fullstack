package com.study4ever.courseservice.service;

import com.study4ever.courseservice.config.RabbitMQTestConfig;
import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Import(RabbitMQTestConfig.class)
class RabbitMQIntegrationTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private UserReferenceRepository userReferenceRepository;

    @Autowired
    private Queue userQueue;

    private UserCreatedEvent userCreatedEvent;
    private UserUpdatedEvent userUpdatedEvent;
    private UserDeletedEvent userDeletedEvent;
    private static final UUID TEST_USER_ID = UUID.randomUUID();;

    @BeforeEach
    void setUp() {
        // Clean up any existing test data
        userReferenceRepository.deleteById(TEST_USER_ID);

        // Setup test events
        userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(TEST_USER_ID);
        userCreatedEvent.setUsername("integration-test-user");
        userCreatedEvent.setEmail("integration@test.com");
        userCreatedEvent.setActive(true);

        userUpdatedEvent = new UserUpdatedEvent();
        userUpdatedEvent.setId(TEST_USER_ID);
        userUpdatedEvent.setUsername("updated-integration-user");
        userUpdatedEvent.setEmail("updated@test.com");
        userUpdatedEvent.setActive(true);

        userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(TEST_USER_ID);
    }

    @AfterEach
    void tearDown() {
        // Clean up test data
        userReferenceRepository.deleteById(TEST_USER_ID);
    }

    @Test
    void shouldCreateUserWhenUserCreatedEventReceived() {
        // Given & When: Send UserCreatedEvent to the queue
        rabbitTemplate.convertAndSend(userQueue.getName(), userCreatedEvent);

        // Then: UserReference should be created
        await().atMost(5, TimeUnit.SECONDS).until(() -> 
            userReferenceRepository.existsById(TEST_USER_ID));

        // Verify the stored user data
        UserReference userReference = userReferenceRepository.findById(TEST_USER_ID).orElse(null);
        assertNotNull(userReference);
        assertEquals(userCreatedEvent.getUsername(), userReference.getUsername());
        assertEquals(userCreatedEvent.getEmail(), userReference.getEmail());
        assertEquals(userCreatedEvent.isActive(), userReference.getActive());
    }

    @Test
    void shouldUpdateUserWhenUserUpdatedEventReceived() {
        // Given: Create a user first
        UserReference initialUser = new UserReference();
        initialUser.setId(TEST_USER_ID);
        initialUser.setUsername("initial-user");
        initialUser.setEmail("initial@test.com");
        initialUser.setActive(true);
        userReferenceRepository.save(initialUser);

        // When: Send UserUpdatedEvent to the queue
        rabbitTemplate.convertAndSend(userQueue.getName(), userUpdatedEvent);

        // Then: UserReference should be updated
        await().atMost(5, TimeUnit.SECONDS).until(() -> {
            Optional<UserReference> updated = userReferenceRepository.findById(TEST_USER_ID);
            return updated.isPresent() && userUpdatedEvent.getUsername().equals(updated.get().getUsername());
        });

        // Verify the updated user data
        UserReference userReference = userReferenceRepository.findById(TEST_USER_ID).orElse(null);
        assertNotNull(userReference);
        assertEquals(userUpdatedEvent.getUsername(), userReference.getUsername());
        assertEquals(userUpdatedEvent.getEmail(), userReference.getEmail());
        assertEquals(userUpdatedEvent.isActive(), userReference.getActive());
    }

    @Test
    void shouldDeleteUserWhenUserDeletedEventReceived() {
        // Given: Create a user first
        UserReference userToDelete = new UserReference();
        userToDelete.setId(TEST_USER_ID);
        userToDelete.setUsername("user-to-delete");
        userToDelete.setEmail("delete@test.com");
        userToDelete.setActive(true);
        userReferenceRepository.save(userToDelete);

        // Verify user exists before delete
        assertTrue(userReferenceRepository.existsById(TEST_USER_ID));

        // When: Send UserDeletedEvent to the queue
        rabbitTemplate.convertAndSend(userQueue.getName(), userDeletedEvent);

        // Then: UserReference should be deleted
        await().atMost(5, TimeUnit.SECONDS).until(() -> 
            !userReferenceRepository.existsById(TEST_USER_ID));

        // Verify user no longer exists
        assertFalse(userReferenceRepository.existsById(TEST_USER_ID));
    }
}