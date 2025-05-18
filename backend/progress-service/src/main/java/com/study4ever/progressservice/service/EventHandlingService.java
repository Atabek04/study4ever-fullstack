package com.study4ever.progressservice.service;

import java.util.Map;

@SuppressWarnings("unused")
public interface EventHandlingService {

    void handleUserCreatedEvent(Map<String, Object> userData);

    void handleUserLoginEvent(String userId);
}
