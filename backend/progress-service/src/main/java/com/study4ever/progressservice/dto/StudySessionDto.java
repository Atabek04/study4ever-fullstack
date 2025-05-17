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
public class StudySessionDto {
    private UUID sessionId;
    private String userId;
    private String courseId;
    private String courseTitle;
    private String moduleId;
    private String moduleTitle;
    private String lessonId;
    private String lessonTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Boolean active;
}
