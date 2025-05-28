package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;
import com.study4ever.progressservice.dto.HeartbeatRequest;
import com.study4ever.progressservice.exception.BadRequestException;
import com.study4ever.progressservice.exception.ConflictOperationException;
import com.study4ever.progressservice.exception.ForbiddenOperationException;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.service.StudySessionService;
import com.study4ever.progressservice.service.StudyStreakService;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final StudyStreakService studyStreakService;
    private final UserProgressService userProgressService;

    @Value("${study.session.timeout.minutes:30}")
    private int sessionTimeoutMinutes;

    @Override
    @Transactional
    public StudySessionDto startStudySession(String userId, StartStudySessionRequest request) {
        log.info("Starting study session for user: {}", userId);

        List<StudySession> activeSessions = studySessionRepository.findByUserIdAndActive(userId, true);
        if (!activeSessions.isEmpty()) {
            log.warn("User {} already has active sessions. Ending them first.", userId);
            throw new ConflictOperationException("User " + userId + " already has active sessions.");
        }

        StudySession newSession = StudySession.builder()
                .userId(userId)
                .courseId(request.getCourseId())
                .moduleId(request.getModuleId())
                .lessonId(request.getLessonId())
                .startTime(LocalDateTime.now())
                .lastHeartbeat(LocalDateTime.now())
                .active(true)
                .build();

        StudySession savedSession = studySessionRepository.save(newSession);

        userProgressService.updateLastLoginDate(userId);

        return ProgressMapper.mapToSessionDto(savedSession);
    }

    @Override
    @Transactional
    public StudySessionDto endStudySession(String userId, UUID sessionId) {
        log.info("Ending study session for user: {} with id: {}", userId, sessionId);

        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Study session not found with id: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("User does not own this session");
        }

        if (Boolean.FALSE.equals(session.getActive())) {
            throw new BadRequestException("Session is already ended");
        }

        session.setActive(false);
        session.setEndTime(LocalDateTime.now());
        int durationMinutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
        session.setDurationMinutes(durationMinutes);

        StudySession savedSession = studySessionRepository.save(session);

        if (durationMinutes >= 1) {
            studyStreakService.updateStreak(userId);
        }

        userProgressService.logStudySession(userId, durationMinutes);

        return ProgressMapper.mapToSessionDto(savedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public StudySessionDto getStudySession(String userId, UUID sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Study session not found with id: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("User does not own this session");
        }

        return ProgressMapper.mapToSessionDto(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessions(String userId) {
        return studySessionRepository.findByUserId(userId).stream()
                .map(ProgressMapper::mapToSessionDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessionsByDate(String userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);

        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startOfDay, endOfDay).stream()
                .map(ProgressMapper::mapToSessionDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserStudySessionsByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startDateTime, endDateTime).stream()
                .map(ProgressMapper::mapToSessionDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteStudySession(String userId, UUID sessionId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Study session not found with id: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("User does not own this session");
        }

        studySessionRepository.delete(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> getAllActiveSessions() {
        log.debug("Getting all active study sessions for admin");
        return studySessionRepository.findByActive(true).stream()
                .map(ProgressMapper::mapToSessionDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudySessionDto getActiveUserSession(String userId) {
        log.debug("Getting active session for user: {}", userId);
        List<StudySession> activeSessions = studySessionRepository.findByUserIdAndActive(userId, true);
        return activeSessions.isEmpty() ? null : ProgressMapper.mapToSessionDto(activeSessions.get(0));
    }

    @Override
    @Transactional
    public void updateSessionLocation(HeartbeatRequest request) {
        log.debug("Updating session location for session: {}", request.getSessionId());

        StudySession session = studySessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new NotFoundException("Study session not found with ID: " + request.getSessionId()));

        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new BadRequestException("Cannot update location for inactive session: " + request.getSessionId());
        }

        // Update heartbeat timestamp
        session.setLastHeartbeat(LocalDateTime.now());

        // Update module and lesson if they changed
        boolean updated = false;
        if (request.getModuleId() != null && !request.getModuleId().equals(session.getModuleId())) {
            session.setModuleId(request.getModuleId());
            updated = true;
        }

        if (request.getLessonId() != null && !request.getLessonId().equals(session.getLessonId())) {
            session.setLessonId(request.getLessonId());
            updated = true;
        }

        studySessionRepository.save(session);
        
        if (updated) {
            log.info("Updated session {} location - module: {}, lesson: {}",
                    request.getSessionId(), request.getModuleId(), request.getLessonId());
        }
        
        log.debug("Updated heartbeat for session: {}", request.getSessionId());
    }

    @Override
    @Transactional
    public void cleanupExpiredSessions() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(sessionTimeoutMinutes);
        List<StudySession> expiredSessions = studySessionRepository.findExpiredActiveSessions(expirationTime);
        
        log.info("Found {} expired sessions to cleanup", expiredSessions.size());
        
        for (StudySession session : expiredSessions) {
            try {
                session.setActive(false);
                session.setEndTime(LocalDateTime.now());
                int durationMinutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
                session.setDurationMinutes(durationMinutes);
                
                studySessionRepository.save(session);
                
                // Only update streak and log session if it was at least 1 minute
                if (durationMinutes >= 1) {
                    studyStreakService.updateStreak(session.getUserId());
                    userProgressService.logStudySession(session.getUserId(), durationMinutes);
                }
                
                log.info("Automatically ended expired session {} for user {} (duration: {} minutes)",
                        session.getId(), session.getUserId(), durationMinutes);
                        
            } catch (Exception e) {
                log.error("Failed to cleanup expired session {}: {}", session.getId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudySessionDto> findExpiredActiveSessions() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(sessionTimeoutMinutes);
        return studySessionRepository.findExpiredActiveSessions(expirationTime).stream()
                .map(ProgressMapper::mapToSessionDto)
                .toList();
    }
}
