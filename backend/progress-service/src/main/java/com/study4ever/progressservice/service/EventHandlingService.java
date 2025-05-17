package com.study4ever.progressservice.service;

import java.util.Map;

public interface EventHandlingService {
    
    void handleUserCreatedEvent(Map<String, Object> userData);
    
    void handleUserDeletedEvent(String userId);
    
    void handleCourseEnrollmentEvent(String userId, String courseId);
    
    void handleCourseCompletionEvent(String userId, String courseId);
}
