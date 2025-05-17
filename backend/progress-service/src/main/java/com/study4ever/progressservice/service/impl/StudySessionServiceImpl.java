package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.service.StudySessionService;
import com.study4ever.progressservice.service.StudyStreakService;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final StudyStreakService studyStreakService;
    private final UserProgressService userProgressService;

    @Override
    @Transactional
    public StudySessionDto startStudySession(String userId, StartStudySessionRequest request) {
        log.info("Starting study session for user: {}", userId);
        
        // Check if user already has an active session
        List<StudySession> activeSessions = studySessionRepository.findByUserIdAndActive(userId, true);
        if (!activeSessions.isEmpty()) {
            log.warn("User {} already has active sessions. Ending them first.", userId);
            activeSessions.forEach(session -> {
                session.setActive(false);
                session.setEndTime(LocalDateTime.now());
                int durationMinutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
                session.setDurationMinutes(durationMinutes);
                studySessionRepository.save(session);
            });
        }
        
        // Create new session
        StudySession newSession = StudySession.builder()
                .userId(userId)
                .courseId(request.getCourseId())
                .moduleId(request.getModuleId())
                .lessonId(request.getLessonId())
                .startTime(LocalDateTime.now())
                .active(true)
                .build();
                
        StudySession savedSession = studySessionRepository.save(newSession);
        
        // Update user's last active timestamp
        userProgressService.updateLastLoginDate(userId);
        
        return ProgressMapper.mapToSessionDto(savedSession);
    }

    @Override
    @Transactional
    public StudySessionDto endStudySession(String userId, UUID sessionId) {
        log.info("Ending study session for user: {} with id: {}", userId, sessionId);
        
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found with id: " + sessionId));
        
        if (!session.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        if (!session.getActive()) {
            throw new IllegalArgumentException("Session is already ended");
        }
        
        session.setActive(false);
        session.setEndTime(LocalDateTime.now());
        int durationMinutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
        session.setDurationMinutes(durationMinutes);
        
        StudySession savedSession = studySessionRepository.save(session);
        
        // Update streak if the session is long enough (e.g., at least 1 minute)
        if (durationMinutes >= 1) {
            studyStreakService.updateStreak(userId);
        }
        
        return ProgressMapper.mapToSessionDto(savedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public StudySessionDto getStudySession(String userId, UUID sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found with id: " + sessionId));
        
        if (!session.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        return ProgressMapper.mapToSessionDto(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessions(String userId) {
        return studySessionRepository.findByUserId(userId).stream()
                .map(ProgressMapper::mapToSessionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessionsByDate(String userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        
        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startOfDay, endOfDay).stream()
                .map(ProgressMapper::mapToSessionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessionsByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        
        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startDateTime, endDateTime).stream()
                .map(ProgressMapper::mapToSessionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteStudySession(String userId, UUID sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found with id: " + sessionId));
        
        if (!session.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        studySessionRepository.delete(session);
    }
    
    private long calculateDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        return ChronoUnit.MINUTES.between(startTime, endTime);
    }
}
