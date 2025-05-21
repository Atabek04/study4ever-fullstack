package com.study4ever.courseservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents an active study session in the system.
 * This entity is stored in the course service database and keeps track
 * of current study sessions to prevent duplicates and enable recovery.
 */
@Entity
@Table(
    name = "active_study_session",
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ActiveStudySession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID sessionId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String moduleId;

    @Column(nullable = false)
    private String lessonId;

    @Column(nullable = false)
    private Instant startTime;

    @Column(nullable = false)
    private Instant lastActivityTime;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
    
    /**
     * Updates the session with new location data (module/lesson)
     * and refreshes the last activity timestamp
     */
    public void updateLocation(String moduleId, String lessonId) {
        this.moduleId = moduleId;
        this.lessonId = lessonId;
        this.lastActivityTime = Instant.now();
    }
    
    /**
     * Records activity for this session by updating the lastActivityTime
     */
    public void recordActivity() {
        this.lastActivityTime = Instant.now();
    }
}
