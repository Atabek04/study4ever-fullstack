package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.*;

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
    
    @Column
    private String courseTitle;
    
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
    private Boolean completed = false;
}
