package com.study4ever.courseservice.client;

import com.study4ever.courseservice.dto.HeartbeatRequest;
import com.study4ever.courseservice.dto.StudySessionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProgressServiceClient {

    private final RestTemplate restTemplate;
    
    @Value("${services.progress-service.url:http://localhost:8083}")
    private String progressServiceUrl;

    /**
     * Get the active study session for a user
     */
    public StudySessionDto getActiveSession(String userId) {
        try {
            String url = progressServiceUrl + "/api/v1/sessions/user/" + userId + "/active";
            log.debug("Calling progress service to get active session for user: {}", userId);
            
            return restTemplate.getForObject(url, StudySessionDto.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.debug("No active session found for user: {}", userId);
                return null;
            }
            log.error("Error getting active session for user {}: {}", userId, e.getMessage());
            throw e;
        }
    }

    /**
     * Record a heartbeat to update session location
     */
    public void recordHeartbeat(HeartbeatRequest request) {
        try {
            String url = progressServiceUrl + "/api/v1/sessions/heartbeat";
            log.debug("Recording heartbeat for session: {}", request.getSessionId());
            
            restTemplate.postForObject(url, request, Void.class);
        } catch (Exception e) {
            log.error("Error recording heartbeat for session {}: {}", request.getSessionId(), e.getMessage());
            throw e;
        }
    }
}
