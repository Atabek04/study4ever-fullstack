package com.study4ever.progressservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "module_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_module_progress_user_course_module",
                        columnNames = {"user_id", "course_id", "module_id"}
                )
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleProgress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String moduleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(nullable = false)
    private Float completionPercentage;

    @Column(nullable = false)
    private LocalDateTime firstAccessDate;

    @Column(nullable = false)
    private LocalDateTime lastAccessDate;

    @Column
    private LocalDateTime completionDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalLessonsCount = 0;
}
