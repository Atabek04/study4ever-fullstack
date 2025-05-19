package com.study4ever.progressservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
