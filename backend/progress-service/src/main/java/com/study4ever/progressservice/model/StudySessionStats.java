package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "study_session_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySessionStats extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "stats_date", nullable = false)
    private LocalDate statsDate;

    @Column(name = "duration_minutes", nullable = false)
    private Long durationMinutes;

    @Column(name = "session_count", nullable = false)
    private Integer sessionCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private StatsType type;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    public enum StatsType {
        DAILY, WEEKLY, MONTHLY, YEARLY
    }
}
