package com.study4ever.progressservice.dto;

import com.study4ever.progressservice.model.ProgressStatus;
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
    private ProgressStatus status;
    private Float completionPercentage;
    private LocalDateTime lastAccessDate;
}
