package com.study4ever.courseservice.client;

import com.study4ever.courseservice.dto.HeartbeatRequest;
import com.study4ever.courseservice.dto.ProgressStartSessionRequest;
import com.study4ever.courseservice.dto.StartStudySessionRequest;
import com.study4ever.courseservice.dto.StudySessionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

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
            String url = progressServiceUrl + "/api/v1/sessions/active/single";
            log.debug("Calling progress service to get active session for user: {}", userId);

            // Create headers with X-User-Id
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId);
            HttpEntity<Object> entity = new HttpEntity<>(headers);

            return restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, StudySessionDto.class).getBody();
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

    /**
     * Create a new study session
     */
    public StudySessionDto createSession(StartStudySessionRequest request) {
        try {
            String url = progressServiceUrl + "/api/v1/sessions/start";
            log.debug("Creating new study session for user: {}, course: {}, module: {}, lesson: {}",
                    request.getUserId(), request.getCourseId(), request.getModuleId(), request.getLessonId());

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", request.getUserId());

            var progressRequest = ProgressStartSessionRequest.builder()
                    .courseId(request.getCourseId())
                    .moduleId(request.getModuleId())
                    .lessonId(request.getLessonId())
                    .build();
            HttpEntity<Object> entity = new HttpEntity<>(progressRequest, headers);

            return restTemplate.postForObject(url, entity, StudySessionDto.class);
        } catch (Exception e) {
            log.error("Error creating session for user {}: {}", request.getUserId(), e.getMessage());
            throw e;
        }
    }
}
