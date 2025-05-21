package com.study4ever.progressservice.dto;

import com.study4ever.progressservice.model.ProgressStatus;
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
    private String moduleId;
    private ProgressStatus status;
    private Float completionPercentage;
    private LocalDateTime firstAccessDate;
    private LocalDateTime lastAccessDate;
    private LocalDateTime completionDate;
    private Integer totalLessonsCount;
}
