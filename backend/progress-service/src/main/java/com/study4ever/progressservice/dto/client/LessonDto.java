package com.study4ever.progressservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for lesson details received from Course Service.
 * Maps to LessonSummaryResponseDto from Course Service for basic info,
 * and full Lesson model for detailed lesson data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private Integer durationMinutes;
    private Integer sortOrder;
    private Long moduleId; // Only available in full lesson details
}
