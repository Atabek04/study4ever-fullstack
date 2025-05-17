package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressSummaryDto {
    private String courseId;
    private String courseTitle;
    private ProgressStatusDto status;
    private Float completionPercentage;
    private LocalDateTime lastAccessDate;
}
