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

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress extends BaseEntity {

    @Id
    private String userId;

    @Column(nullable = false)
    private Integer totalCompletedLessons;

    @Column(nullable = false)
    private Integer totalCompletedModules;

    @Column(nullable = false)
    private Integer totalCompletedCourses;

    @Column(nullable = false)
    private Long totalStudyTimeMinutes;  // todo: study time should be added after session is ended

    @Column(nullable = false)
    private LocalDateTime lastActiveTimestamp;

    @Column(nullable = false)
    private LocalDateTime registrationDate;
}
