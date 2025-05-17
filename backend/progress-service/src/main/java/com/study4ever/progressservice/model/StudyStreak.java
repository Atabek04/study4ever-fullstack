package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "study_streak")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyStreak extends BaseEntity {

    @Id
    private String userId;
    
    @Column(nullable = false)
    private Integer currentStreakDays;
    
    @Column(nullable = false)
    private Integer longestStreakDays;
    
    @Column(nullable = false)
    private LocalDate lastStudyDate;
    
    @Column(nullable = false)
    private LocalDate streakStartDate;
}
