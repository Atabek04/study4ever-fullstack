package com.study4ever.progressservice.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.study4ever.progressservice.event.StudySessionEventConsumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStartupListener implements ApplicationListener<ApplicationReadyEvent> {

    private final StudySessionEventConsumer studySessionEventConsumer;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("Application started, initializing session recovery");
        studySessionEventConsumer.recoverActiveSessions();
    }
}
