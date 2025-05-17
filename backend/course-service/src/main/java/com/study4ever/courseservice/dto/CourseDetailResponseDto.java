package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Detailed course DTO that includes summary information about modules
 * but without the full lesson data to prevent recursive fetching issues
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailResponseDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;

    @Builder.Default
    private Set<ModuleSummaryDto> modules = new HashSet<>();
}