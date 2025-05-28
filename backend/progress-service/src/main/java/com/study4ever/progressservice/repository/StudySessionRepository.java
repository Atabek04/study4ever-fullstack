package com.study4ever.progressservice.repository;

import com.study4ever.progressservice.model.StudySession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {

    List<StudySession> findByUserId(String userId);

    List<StudySession> findByUserIdAndActive(String userId, boolean active);

    Page<StudySession> findByUserIdOrderByStartTimeDesc(String userId, Pageable pageable);

    List<StudySession> findByUserIdAndStartTimeBetween(String userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM StudySession s WHERE s.active = true AND s.lastHeartbeat < :expirationTime")
    List<StudySession> findExpiredActiveSessions(@Param("expirationTime") LocalDateTime expirationTime);

    List<StudySession> findByActive(boolean active);
}
