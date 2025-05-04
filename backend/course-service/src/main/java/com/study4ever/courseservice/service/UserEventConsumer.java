package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.UserCreatedEvent;
import com.study4ever.courseservice.dto.UserDeletedEvent;
import com.study4ever.courseservice.dto.UserUpdatedEvent;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final UserReferenceRepository userReferenceRepository;

    @RabbitListener(queues = "user.queue")
    @Retryable(
        value = Exception.class,
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
            
            // Check if the user reference already exists
            if (userReferenceRepository.existsById(event.getId())) {
                log.warn("UserReference with ID: {} already exists. Skipping creation.", event.getId());
                return;
            }
            
            UserReference userReference = new UserReference();
            userReference.setId(event.getId());
            userReference.setUsername(event.getUsername());
            userReference.setEmail(event.getEmail());
            userReference.setActive(event.isActive());
            
            userReferenceRepository.save(userReference);
            log.info("UserReference created successfully for user with ID: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing UserCreatedEvent for user with ID: {}", event.getId(), e);
            throw new AmqpRejectAndDontRequeueException("Error processing UserCreatedEvent", e);
        }
    }

    @RabbitListener(queues = "user.queue")
    @Retryable(
        value = Exception.class,
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
                    .orElseThrow(() -> new RuntimeException("UserReference not found with ID: " + event.getId()));
            
            userReference.setUsername(event.getUsername());
            userReference.setEmail(event.getEmail());
            userReference.setActive(event.isActive());
            
            userReferenceRepository.save(userReference);
            log.info("UserReference updated successfully for user with ID: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing UserUpdatedEvent for user with ID: {}", event.getId(), e);
            throw new AmqpRejectAndDontRequeueException("Error processing UserUpdatedEvent", e);
        }
    }

    @RabbitListener(queues = "user.queue")
    @Retryable(
        value = Exception.class,
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
    public void recover(Exception e, Object event) {
        log.error("All retry attempts failed for event: {}", event, e);
        // At this point, the message will be sent to the dead letter queue
        // You could implement additional error handling here, such as:
        // - Send a notification
        // - Log to a monitoring system
        // - Trigger manual intervention workflow
    }
}