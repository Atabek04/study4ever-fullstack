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
public class CourseProgressDto {
    private UUID progressId;
    private String userId;
    private String courseId;
    private String courseTitle;
    private ProgressStatusDto status;
    private Float completionPercentage;
    private String currentModuleId;
    private String currentModuleTitle;
    private String currentLessonId;
    private String currentLessonTitle;
    private LocalDateTime enrollmentDate;
    private LocalDateTime lastAccessDate;
    private LocalDateTime completionDate;
    private Long totalStudyTimeMinutes;
    private Integer completedModulesCount;
    private Integer totalModulesCount;
    private Integer completedLessonsCount;
    private Integer totalLessonsCount;
}
