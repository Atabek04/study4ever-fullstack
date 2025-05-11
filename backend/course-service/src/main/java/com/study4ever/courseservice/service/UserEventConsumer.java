package com.study4ever.courseservice.service;

import com.study4ever.courseservice.config.RabbitMQConfig;
import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.model.Role;
import com.study4ever.courseservice.model.UserReference;
import com.study4ever.courseservice.repository.UserReferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final UserReferenceRepository userReferenceRepository;

    @RabbitListener(queues = RabbitMQConfig.USER_CREATED_QUEUE)
    @Retryable(
        retryFor = Exception.class,
        maxAttemptsExpression = "${retry.maxAttempts:3}",
        backoff = @Backoff(
            delayExpression = "${retry.initialDelay:1000}",
            multiplierExpression = "${retry.multiplier:2}",
            maxDelayExpression = "${retry.maxDelay:10000}"
        )
    )
    @Transactional
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        try {
            log.info("Received UserCreatedEvent for user with ID: {}", event.getId());
            
            if (userReferenceRepository.existsById(event.getId())) {
                log.warn("UserReference with ID: {} already exists. Skipping creation.", event.getId());
                return;
            }
            
            UserReference userReference = new UserReference();
            userReference.setId(event.getId());
            userReference.setUsername(event.getUsername());
            userReference.setEmail(event.getEmail());
            userReference.setFirstName(event.getFirstName());
            userReference.setLastName(event.getLastName());
            userReference.setRoles(convertStringRolesToEnums(event.getRoles()));
            userReference.setActive(event.isActive());
            
            userReferenceRepository.save(userReference);
            log.info("UserReference created successfully for user with ID: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing UserCreatedEvent for user with ID: {}", event.getId(), e);
            throw new AmqpRejectAndDontRequeueException("Error processing UserCreatedEvent", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.USER_UPDATED_QUEUE)
    @Retryable(
        retryFor = Exception.class,
        maxAttemptsExpression = "${retry.maxAttempts:3}",
        backoff = @Backoff(
            delayExpression = "${retry.initialDelay:1000}",
            multiplierExpression = "${retry.multiplier:2}",
            maxDelayExpression = "${retry.maxDelay:10000}"
        )
    )
    @Transactional
    public void handleUserUpdatedEvent(UserUpdatedEvent event) {
        try {
            log.info("Received UserUpdatedEvent for user with ID: {}", event.getId());
            
            UserReference userReference = userReferenceRepository.findById(event.getId())
                    .orElseThrow(() -> new NotFoundException("UserReference not found with ID: " + event.getId()));
            
            userReference.setUsername(event.getUsername());
            userReference.setEmail(event.getEmail());
            userReference.setFirstName(event.getFirstName());
            userReference.setLastName(event.getLastName());
            userReference.setRoles(convertStringRolesToEnums(event.getRoles()));
            userReference.setActive(event.isActive());
            
            userReferenceRepository.save(userReference);
            log.info("UserReference updated successfully for user with ID: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing UserUpdatedEvent for user with ID: {}", event.getId(), e);
            throw new AmqpRejectAndDontRequeueException("Error processing UserUpdatedEvent", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.USER_DELETED_QUEUE)
    @Retryable(
        retryFor = Exception.class,
        maxAttemptsExpression = "${retry.maxAttempts:3}",
        backoff = @Backoff(
            delayExpression = "${retry.initialDelay:1000}",
            multiplierExpression = "${retry.multiplier:2}",
            maxDelayExpression = "${retry.maxDelay:10000}"
        )
    )
    @Transactional
    public void handleUserDeletedEvent(UserDeletedEvent event) {
        try {
            log.info("Received UserDeletedEvent for user with ID: {}", event.getId());
            
            if (!userReferenceRepository.existsById(event.getId())) {
                log.warn("UserReference with ID: {} not found. Skipping deletion.", event.getId());
                return;
            }
            
            userReferenceRepository.deleteById(event.getId());
            log.info("UserReference deleted successfully for user with ID: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing UserDeletedEvent for user with ID: {}", event.getId(), e);
            throw new AmqpRejectAndDontRequeueException("Error processing UserDeletedEvent", e);
        }
    }

    @Recover
    public void recover(Exception e, UserCreatedEvent event) {
        log.error("All retry attempts failed for UserCreatedEvent: {}", event, e);
        // Message will be sent to the dead letter queue
        // Additional error handling can be implemented here
    }
    
    @Recover
    public void recover(Exception e, UserUpdatedEvent event) {
        log.error("All retry attempts failed for UserUpdatedEvent: {}", event, e);
        // Message will be sent to the dead letter queue
        // Additional error handling can be implemented here
    }
    
    @Recover
    public void recover(Exception e, UserDeletedEvent event) {
        log.error("All retry attempts failed for UserDeletedEvent: {}", event, e);
        // Message will be sent to the dead letter queue
        // Additional error handling can be implemented here
    }
    
    private Set<Role> convertStringRolesToEnums(Set<String> stringRoles) {
        if (stringRoles == null) {
            return Set.of();
        }
        return stringRoles.stream()
            .map(Role::fromString)
            .filter(role -> role != null)
            .collect(Collectors.toSet());
    }
}