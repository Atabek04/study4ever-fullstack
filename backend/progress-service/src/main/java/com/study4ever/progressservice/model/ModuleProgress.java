package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "module_progress")
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
}
