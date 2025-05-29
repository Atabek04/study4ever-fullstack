package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_rankings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardRankings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "total_study_minutes", nullable = false)
    private Long totalStudyMinutes;
    
    @Column(name = "session_count", nullable = false)
    private Integer sessionCount;
    
    @Column(name = "rank", nullable = false)
    private Integer rank;
    
    @Column(name = "period_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private PeriodType periodType;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
