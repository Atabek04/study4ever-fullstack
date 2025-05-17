package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleProgressDto {
    private UUID progressId;
    private String userId;
    private String courseId;
    private String courseTitle;
    private String moduleId;
    private String moduleTitle;
    private ProgressStatusDto status;
    private Float completionPercentage;
    private LocalDateTime firstAccessDate;
    private LocalDateTime lastAccessDate;
    private LocalDateTime completionDate;
    private Integer completedLessonsCount;
    private Integer totalLessonsCount;
}
