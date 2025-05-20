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
public class CourseProgressDto {
    private UUID progressId;
    private String userId;
    private String courseId;
    private ProgressStatus status;
    private Float completionPercentage;
    private String currentModuleId;
    private String currentLessonId;
    private LocalDateTime enrollmentDate;
    private LocalDateTime lastAccessDate;
    private Integer totalModulesCount;
    private Integer completedLessonsCount;
    private Integer totalLessonsCount;
}
