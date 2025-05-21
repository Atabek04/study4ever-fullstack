package com.study4ever.progressservice.event;

import com.study4ever.progressservice.event.message.SessionReconciliationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionReconciliationHandler {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.study-sessions}")
    private String exchange;

    @Value("${rabbitmq.routing-keys.session-reconciliation-response}")
    private String responseRoutingKey;

    public void handleReconciliationRequest(String userId, List<UUID> remoteSessionIds, Set<UUID> localSessionIds) {
        List<UUID> missingInProgressService = remoteSessionIds.stream()
                .filter(id -> !localSessionIds.contains(id))
                .toList();
        List<UUID> missingInCourseService = localSessionIds.stream()
                .filter(id -> !remoteSessionIds.contains(id))
                .toList();

        SessionReconciliationResponse response = new SessionReconciliationResponse(userId, missingInProgressService,
                missingInCourseService);

        rabbitTemplate.convertAndSend(exchange, responseRoutingKey, response);
    }

    public void handleReconciliationResponse(SessionReconciliationResponse response) {
        log.info("Session reconciliation for user {}: missing in progress-service: {}, missing in course-service: {}",
                response.getUserId(), response.getMissingInProgressService(), response.getMissingInCourseService());
    }
}
