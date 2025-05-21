package com.study4ever.authservice.service;

import com.study4ever.authservice.config.RabbitMQConfig;
import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import com.study4ever.authservice.dto.UserUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserCreatedEvent(UserCreatedEvent event) {
        log.info("Sending UserCreated event: {}", event);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendCreatedEventMessage(event);
                }
            });
        } else {
            sendCreatedEventMessage(event);
        }
    }

    public void sendUserUpdatedEvent(UserUpdatedEvent event) {
        log.info("Sending user updated event: {}", event);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendUpdatedEventMessage(event);
                }
            });
        } else {
            sendUpdatedEventMessage(event);
        }
    }

    public void sendUserDeletedEvent(UserDeletedEvent event) {
        log.info("Sending user deleted event: {}", event);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendDeletedEventMessage(event);
                }
            });
        } else {
            sendDeletedEventMessage(event);
        }
    }

    private void sendCreatedEventMessage(UserCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_CREATED_ROUTING_KEY,
                    event
            );
            log.info("UserCreated event sent successfully: {}", event.getId());
        } catch (Exception e) {
            log.error("Failed to send UserCreated event: {}", event, e);
            throw e; // Rethrow to allow proper error handling
        }
    }

    private void sendUpdatedEventMessage(UserUpdatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_UPDATED_ROUTING_KEY,
                    event
            );
            log.info("UserUpdated event sent successfully: {}", event.getId());
        } catch (Exception e) {
            log.error("Failed to send UserUpdated event: {}", event, e);
            throw e; // Rethrow to allow proper error handling
        }
    }

    private void sendDeletedEventMessage(UserDeletedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_DELETED_ROUTING_KEY,
                    event
            );
            log.info("UserDeleted event sent successfully: {}", event.getId());
        } catch (Exception e) {
            log.error("Failed to send UserDeleted event: {}", event, e);
            throw e; // Rethrow to allow proper error handling
        }
    }
}