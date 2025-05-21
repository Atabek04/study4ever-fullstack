package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.config.CacheConfig;
import com.study4ever.courseservice.model.ActiveStudySession;
import com.study4ever.courseservice.repository.ActiveStudySessionRepository;
import com.study4ever.courseservice.service.ActiveStudySessionPersistenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActiveStudySessionPersistenceServiceImpl implements ActiveStudySessionPersistenceService {
    private final ActiveStudySessionRepository sessionRepository;

    @Override
    @Transactional
    public ActiveStudySession saveSession(ActiveStudySession session) {
        return sessionRepository.save(session);
    }

    @Override
    @Cacheable(value = CacheConfig.ACTIVE_SESSIONS_CACHE, key = "#sessionId")
    @Transactional(readOnly = true)
    public Optional<ActiveStudySession> findSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId);
    }

    @Override
    @Cacheable(value = CacheConfig.USER_SESSIONS_CACHE, key = "#userId")
    @Transactional(readOnly = true)
    public List<ActiveStudySession> findSessionsByUser(String userId) {
        return sessionRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveSession(String userId) {
        return sessionRepository.existsByUserId(userId);
    }

    @Override
    @CachePut(value = CacheConfig.ACTIVE_SESSIONS_CACHE, key = "#sessionId")
    @CacheEvict(value = CacheConfig.USER_SESSIONS_CACHE, key = "#result.orElse(new com.study4ever.courseservice.model.ActiveStudySession()).userId")
    @Transactional
    public Optional<ActiveStudySession> updateSessionLocation(UUID sessionId, String moduleId, String lessonId) {
        return sessionRepository.findById(sessionId)
                .map(session -> {
                    session.updateLocation(moduleId, lessonId);
                    return sessionRepository.save(session);
                });
    }

    @Override
    @CachePut(value = CacheConfig.ACTIVE_SESSIONS_CACHE, key = "#sessionId")
    @Transactional
    public boolean recordActivity(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .map(session -> {
                    session.recordActivity();
                    sessionRepository.save(session);
                    return true;
                })
                .orElse(false);
    }

    @Override
    @CacheEvict(cacheNames = {
            CacheConfig.ACTIVE_SESSIONS_CACHE,
            CacheConfig.USER_SESSIONS_CACHE
    }, allEntries = true)
    @Transactional
    public boolean endSession(UUID sessionId) {
        if (sessionRepository.existsById(sessionId)) {
            sessionRepository.deleteById(sessionId);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActiveStudySession> getAllActiveSessions() {
        return sessionRepository.findAll();
    }

    @Override
    @CacheEvict(cacheNames = {
            CacheConfig.ACTIVE_SESSIONS_CACHE,
            CacheConfig.USER_SESSIONS_CACHE
    }, allEntries = true)
    @Transactional
    public int endInactiveSessions(int inactivityMinutes) {
        Instant cutoffTime = Instant.now().minus(inactivityMinutes, ChronoUnit.MINUTES);
        List<ActiveStudySession> inactiveSessions = sessionRepository.findByLastActivityTimeBefore(cutoffTime);
        if (!inactiveSessions.isEmpty()) {
            sessionRepository.deleteAll(inactiveSessions);
        }
        return inactiveSessions.size();
    }

    @Override
    @CacheEvict(cacheNames = {
            CacheConfig.ACTIVE_SESSIONS_CACHE,
            CacheConfig.USER_SESSIONS_CACHE
    }, allEntries = true)
    @Transactional
    public int endExpiredSessions(int maxSessionDurationMinutes) {
        Instant cutoffTime = Instant.now().minus(maxSessionDurationMinutes, ChronoUnit.MINUTES);
        List<ActiveStudySession> expiredSessions = sessionRepository.findByStartTimeBefore(cutoffTime);
        if (!expiredSessions.isEmpty()) {
            sessionRepository.deleteAll(expiredSessions);
        }
        return expiredSessions.size();
    }
}
