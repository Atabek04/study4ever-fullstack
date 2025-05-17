package com.study4ever.progressservice.model;

import jakarta.persistence.*;
import lombok.*;

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
    private Long totalStudyTimeMinutes;
    
    @Column(nullable = false)
    private LocalDateTime lastActiveTimestamp;
    
    @Column(nullable = false)
    private LocalDateTime registrationDate;
}
