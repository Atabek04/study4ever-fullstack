package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Basic module information without lessons, for use in API responses
 * that don't require detailed lesson information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponseDto {
    private Long id;
    private String title;
    private Integer sortOrder;
    private Long courseId;
    private Integer lessonCount;
}