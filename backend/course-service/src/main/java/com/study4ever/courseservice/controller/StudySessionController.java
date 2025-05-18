package com.study4ever.courseservice.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.study4ever.courseservice.dto.StudySessionRequest;
import com.study4ever.courseservice.dto.StudySessionResponse;
import com.study4ever.courseservice.event.StudySessionEndedEvent;
import com.study4ever.courseservice.event.StudySessionEventPublisher;
import com.study4ever.courseservice.event.StudySessionHeartbeatEvent;
import com.study4ever.courseservice.event.StudySessionStartedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
@Slf4j
public class StudySessionController {

    private final StudySessionEventPublisher eventPublisher;
    
    private final Map<String, ActiveSession> activeSessions = new ConcurrentHashMap<>();
    
    private final ScheduledExecutorService heartbeatExecutor = Executors.newScheduledThreadPool(1);
    
    private static final long HEARTBEAT_INTERVAL_SECONDS = 30;
    
    private static final long SESSION_TIMEOUT_MINUTES = 20;
    
    
    @PostMapping("/start")
    public ResponseEntity<StudySessionResponse> startStudySession(@RequestBody StudySessionRequest request) {
        log.info("Starting study session for user {} in course {}", request.getUserId(), request.getCourseId());
        
        String sessionId = UUID.randomUUID().toString();
        LocalDateTime startTime = LocalDateTime.now();
        
        StudySessionStartedEvent event = new StudySessionStartedEvent(
            request.getUserId(),
            request.getCourseId(),
            request.getModuleId(),
            request.getLessonId(),
            startTime
        );
        
        eventPublisher.publishStudySessionStarted(event);
        
        ActiveSession session = new ActiveSession(
            sessionId,
            request.getUserId(),
            request.getCourseId(),
            request.getModuleId(),
            request.getLessonId(),
            startTime.atZone(ZoneId.systemDefault()).toInstant()
        );
        
        activeSessions.put(sessionId, session);
        
        scheduleHeartbeat(session);
        
        return ResponseEntity.ok(new StudySessionResponse(sessionId, startTime.atZone(ZoneId.systemDefault()).toInstant()));
    }
    
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> endStudySession(@PathVariable String sessionId) {
        log.info("Ending study session: {}", sessionId);
        
        ActiveSession session = activeSessions.remove(sessionId);
        
        if (session != null) {
            StudySessionEndedEvent event = new StudySessionEndedEvent(
                session.getUserId(),
                UUID.fromString(sessionId),
                LocalDateTime.now()
            );
            
            eventPublisher.publishStudySessionEnded(event);
            
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{sessionId}/update")
    public ResponseEntity<Void> updateStudySession(
            @PathVariable String sessionId,
            @RequestBody StudySessionRequest request) {
        
        ActiveSession session = activeSessions.get(sessionId);
        
        if (session != null) {
            session.setModuleId(request.getModuleId());
            session.setLessonId(request.getLessonId());
            session.setLastActivityTime(Instant.now());
            
            sendHeartbeat(session);
            
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{sessionId}/keepalive")
    public ResponseEntity<Void> keepAliveStudySession(@PathVariable String sessionId) {
        ActiveSession session = activeSessions.get(sessionId);
        
        if (session != null) {
            session.setLastActivityTime(Instant.now());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    private void scheduleHeartbeat(ActiveSession session) {
        heartbeatExecutor.scheduleAtFixedRate(
            () -> {
                ActiveSession currentSession = activeSessions.get(session.getSessionId());
                
                if (currentSession != null) {
                    Instant now = Instant.now();
                    
                    if (now.minusSeconds(SESSION_TIMEOUT_MINUTES * 60).isAfter(currentSession.getLastActivityTime())) {
                        log.info("Auto-ending inactive study session: {}", currentSession.getSessionId());
                        endStudySession(currentSession.getSessionId());
                    } else {
                        sendHeartbeat(currentSession);
                    }
                }
            },
            HEARTBEAT_INTERVAL_SECONDS,
            HEARTBEAT_INTERVAL_SECONDS,
            TimeUnit.SECONDS
        );
    }
    
    private void sendHeartbeat(ActiveSession session) {
        var event = StudySessionHeartbeatEvent.builder()
                .userId(session.getUserId())
                .sessionId(UUID.fromString(session.getSessionId()))
                .courseId(session.getCourseId())
                .moduleId(session.getModuleId())
                .lessonId(session.getLessonId())
                .timestamp(LocalDateTime.now())
                .build();
        
        eventPublisher.publishStudySessionHeartbeat(event);
    }
    
    private static class ActiveSession {
        private final String sessionId;
        private final String userId;
        private final String courseId;
        private String moduleId;
        private String lessonId;
        private Instant lastActivityTime;
        
        public ActiveSession(String sessionId, String userId, String courseId, 
                            String moduleId, String lessonId, Instant startTime) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.courseId = courseId;
            this.moduleId = moduleId;
            this.lessonId = lessonId;
            this.lastActivityTime = startTime;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public String getUserId() {
            return userId;
        }
        
        public String getCourseId() {
            return courseId;
        }
        
        public String getModuleId() {
            return moduleId;
        }
        
        public void setModuleId(String moduleId) {
            this.moduleId = moduleId;
        }
        
        public String getLessonId() {
            return lessonId;
        }
        
        public void setLessonId(String lessonId) {
            this.lessonId = lessonId;
        }
        
        public Instant getLastActivityTime() {
            return lastActivityTime;
        }
        
        public void setLastActivityTime(Instant lastActivityTime) {
            this.lastActivityTime = lastActivityTime;
        }
    }
}
