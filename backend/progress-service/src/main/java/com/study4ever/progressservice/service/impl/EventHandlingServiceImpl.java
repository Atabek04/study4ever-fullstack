package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.service.EventHandlingService;
import com.study4ever.progressservice.service.UserProgressInitializeService;
import com.study4ever.progressservice.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventHandlingServiceImpl implements EventHandlingService {

    private final UserProgressService userProgressService;
    private final UserProgressInitializeService userProgressInitializeService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.user-created}")
    @Transactional
    public void handleUserCreatedEvent(Map<String, Object> userData) {
        String userId = (String) userData.get("userId");

        if (userId == null) {
            log.error("Received user created event with null userId");
            return;
        }

        log.info("Handling user created event for user ID: {}", userId);
        userProgressInitializeService.initializeUserProgress(userId);
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.user-login}")
    @Transactional
    public void handleUserLoginEvent(String userId) {
        if (userId == null) {
            log.error("Received user login event with null userId");
            return;
        }

        log.info("Handling user login event for user ID: {}", userId);
        userProgressService.updateLastLoginDate(userId);
    }
}
