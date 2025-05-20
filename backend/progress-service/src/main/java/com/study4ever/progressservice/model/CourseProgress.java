package com.study4ever.progressservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String courseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(nullable = false)
    private Float completionPercentage;

    @Column
    private String currentModuleId;

    @Column
    private String currentLessonId;

    @Column(nullable = false)
    private LocalDateTime enrollmentDate;

    @Column(nullable = false)
    private LocalDateTime lastAccessDate;

    @Column
    private LocalDateTime completionDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer completedLessonsCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalLessonsCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalModulesCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;
}
