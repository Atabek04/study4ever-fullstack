package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the next lesson a user should continue with in a course.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextLessonDto {
    private String moduleId;
    private String moduleTitle;
    private String lessonId;
    private String lessonTitle;
    private Double courseCompletionPercentage;
    private String lastUpdated;
}
