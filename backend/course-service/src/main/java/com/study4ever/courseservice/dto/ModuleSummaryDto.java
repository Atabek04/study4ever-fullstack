package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A lightweight DTO for Module that doesn't include lesson data
 * Used for embedding in CourseDetailResponseDto to prevent recursive fetching
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleSummaryDto {
    private Long id;
    private String title;
    private Integer sortOrder;
    private Integer lessonCount;
}