package com.study4ever.courseservice.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.study4ever.courseservice.model.ActiveStudySession;

/**
 * Repository for managing active study sessions in the database.
 */
@Repository
public interface ActiveStudySessionRepository extends JpaRepository<ActiveStudySession, UUID> {
    
    /**
     * Finds active sessions for a specific user
     * 
     * @param userId The ID of the user
     * @return A list of active sessions for the user
     */
    List<ActiveStudySession> findByUserId(String userId);
    
    /**
     * Checks if a user has any active sessions
     * 
     * @param userId The ID of the user
     * @return true if the user has active sessions, false otherwise
     */
    boolean existsByUserId(String userId);

    /**
     * Finds sessions that have been inactive for longer than the specified duration
     *
     * @param cutoffTime The time threshold for inactivity
     * @return List of inactive sessions
     */
    List<ActiveStudySession> findByLastActivityTimeBefore(Instant cutoffTime);
    
    /**
     * Finds sessions that have been active for longer than the maximum allowed duration
     *
     * @param startTimeBefore The time threshold for maximum session duration
     * @return List of sessions exceeding maximum duration
     */
    List<ActiveStudySession> findByStartTimeBefore(Instant startTimeBefore);
    
    /**
     * Deletes a session and returns whether the operation was successful
     *
     * @param sessionId The ID of the session to delete
     * @return true if a session was deleted, false otherwise
     */
    @Query("DELETE FROM ActiveStudySession s WHERE s.sessionId = :sessionId")
    boolean deleteBySessionId(@Param("sessionId") UUID sessionId);
}
