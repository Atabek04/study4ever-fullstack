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
public class LessonProgressDto {
    private UUID progressId;
    private String userId;
    private String courseId;
    private String courseTitle;
    private String moduleId;
    private String moduleTitle;
    private String lessonId;
    private String lessonTitle;
    private ProgressStatusDto status;
    private LocalDateTime firstAccessDate;
    private LocalDateTime lastAccessDate;
    private LocalDateTime completionDate;
    private Long studyTimeMinutes;
}
