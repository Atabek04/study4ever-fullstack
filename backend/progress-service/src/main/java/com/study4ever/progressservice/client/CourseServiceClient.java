package com.study4ever.progressservice.client;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Client for interacting with the Course Service.
 * Uses RestTemplate for communication.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CourseServiceClient {

    private final RestTemplate restTemplate;
    
    @Value("${app.course-service.url:http://course-service:8080}")
    private String courseServiceBaseUrl;

    /**
     * Retrieves course details including modules and lessons structure.
     * 
     * @param courseId The ID of the course to retrieve
     * @return Course details as a Map, or null if not found
     */
    public Map<String, Object> getCourseDetails(String courseId) {
        try {
            String url = courseServiceBaseUrl + "/api/v1/courses/" + courseId + "/details";
            log.debug("Fetching course details from: {}", url);
            
            ResponseEntity<HashMap<String, Object>> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                null, 
                new ParameterizedTypeReference<HashMap<String, Object>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Successfully retrieved course details for course: {}", courseId);
                return response.getBody();
            } else {
                log.warn("Failed to retrieve course details. Status code: {}", response.getStatusCode());
                return null;
            }
        } catch (RestClientException e) {
            log.error("Error retrieving course details for course: {}", courseId, e);
            return null;
        }
    }

    /**
     * Retrieves lesson details by lesson ID.
     * 
     * @param lessonId The ID of the lesson
     * @return Lesson details as a Map, or null if not found
     */
    public Map<String, Object> getLessonDetails(String lessonId) {
        try {
            String url = courseServiceBaseUrl + "/api/v1/lessons/" + lessonId;
            log.debug("Fetching lesson details from: {}", url);
            
            ResponseEntity<HashMap<String, Object>> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                null, 
                new ParameterizedTypeReference<HashMap<String, Object>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Successfully retrieved lesson details for lesson: {}", lessonId);
                return response.getBody();
            } else {
                log.warn("Failed to retrieve lesson details. Status code: {}", response.getStatusCode());
                return null;
            }
        } catch (RestClientException e) {
            log.error("Error retrieving lesson details for lesson: {}", lessonId, e);
            return null;
        }
    }
}
