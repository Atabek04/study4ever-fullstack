package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserEventConsumerTest {

    @Mock
    private UserReferenceRepository userReferenceRepository;

    @InjectMocks
    private UserEventConsumer userEventConsumer;

    private UserCreatedEvent userCreatedEvent;
    private UserUpdatedEvent userUpdatedEvent;
    private UserDeletedEvent userDeletedEvent;
    private UserReference existingUserReference;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        
        // Create test events
        userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setId(testUserId);
        userCreatedEvent.setUsername("testuser");
        userCreatedEvent.setEmail("test@example.com");
        userCreatedEvent.setActive(true);

        userUpdatedEvent = new UserUpdatedEvent();
        userUpdatedEvent.setId(testUserId);
        userUpdatedEvent.setUsername("updateduser");
        userUpdatedEvent.setEmail("updated@example.com");
        userUpdatedEvent.setActive(true);

        userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(testUserId);

        // Create existing user reference
        existingUserReference = new UserReference();
        existingUserReference.setId(testUserId);
        existingUserReference.setUsername("olduser");
        existingUserReference.setEmail("old@example.com");
        existingUserReference.setActive(true);
    }

    @Test
    void handleUserCreatedEvent_WhenUserDoesNotExist_ShouldCreateNewUser() {
        // Given
        when(userReferenceRepository.existsById(userCreatedEvent.getId())).thenReturn(false);

        // When
        userEventConsumer.handleUserCreatedEvent(userCreatedEvent);

        // Then
        verify(userReferenceRepository).existsById(userCreatedEvent.getId());
        verify(userReferenceRepository).save(any(UserReference.class));
    }

    @Test
    void handleUserCreatedEvent_WhenUserAlreadyExists_ShouldSkipCreation() {
        // Given
        when(userReferenceRepository.existsById(userCreatedEvent.getId())).thenReturn(true);

        // When
        userEventConsumer.handleUserCreatedEvent(userCreatedEvent);

        // Then
        verify(userReferenceRepository).existsById(userCreatedEvent.getId());
        verify(userReferenceRepository, never()).save(any(UserReference.class));
    }

    @Test
    void handleUserCreatedEvent_WhenExceptionOccurs_ShouldThrowAmqpException() {
        // Given
        when(userReferenceRepository.existsById(userCreatedEvent.getId())).thenThrow(new RuntimeException("Test exception"));

        // When & Then
        assertThrows(AmqpRejectAndDontRequeueException.class, () -> {
            userEventConsumer.handleUserCreatedEvent(userCreatedEvent);
        });
    }

    @Test
    void handleUserUpdatedEvent_WhenUserExists_ShouldUpdateUser() {
        // Given
        when(userReferenceRepository.findById(userUpdatedEvent.getId())).thenReturn(Optional.of(existingUserReference));

        // When
        userEventConsumer.handleUserUpdatedEvent(userUpdatedEvent);

        // Then
        verify(userReferenceRepository).findById(userUpdatedEvent.getId());
        verify(userReferenceRepository).save(existingUserReference);
        
        // Verify the user reference was updated with new values
        verify(userReferenceRepository).save(argThat(userReference -> 
            userReference.getUsername().equals(userUpdatedEvent.getUsername()) &&
            userReference.getEmail().equals(userUpdatedEvent.getEmail()) &&
            userReference.getActive() == userUpdatedEvent.isActive()
        ));
    }

    @Test
    void handleUserUpdatedEvent_WhenUserDoesNotExist_ShouldThrowException() {
        // Given
        when(userReferenceRepository.findById(userUpdatedEvent.getId())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(AmqpRejectAndDontRequeueException.class, () -> {
            userEventConsumer.handleUserUpdatedEvent(userUpdatedEvent);
        });
    }

    @Test
    void handleUserDeletedEvent_WhenUserExists_ShouldDeleteUser() {
        // Given
        when(userReferenceRepository.existsById(userDeletedEvent.getId())).thenReturn(true);

        // When
        userEventConsumer.handleUserDeletedEvent(userDeletedEvent);

        // Then
        verify(userReferenceRepository).existsById(userDeletedEvent.getId());
        verify(userReferenceRepository).deleteById(userDeletedEvent.getId());
    }

    @Test
    void handleUserDeletedEvent_WhenUserDoesNotExist_ShouldSkipDeletion() {
        // Given
        when(userReferenceRepository.existsById(userDeletedEvent.getId())).thenReturn(false);

        // When
        userEventConsumer.handleUserDeletedEvent(userDeletedEvent);

        // Then
        verify(userReferenceRepository).existsById(userDeletedEvent.getId());
        verify(userReferenceRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    void handleUserDeletedEvent_WhenExceptionOccurs_ShouldThrowAmqpException() {
        // Given
        when(userReferenceRepository.existsById(userDeletedEvent.getId())).thenThrow(new RuntimeException("Test exception"));

        // When & Then
        assertThrows(AmqpRejectAndDontRequeueException.class, () -> {
            userEventConsumer.handleUserDeletedEvent(userDeletedEvent);
        });
    }

    @Test
    void recover_ShouldHandleFailedEvents() {
        // This method is difficult to test directly as it's called by Spring Retry framework
        // We can just verify it doesn't throw any exceptions
        userEventConsumer.recover(new RuntimeException("Test exception"), userCreatedEvent);
        // No assertion needed, just verifying it doesn't throw an exception
    }
}