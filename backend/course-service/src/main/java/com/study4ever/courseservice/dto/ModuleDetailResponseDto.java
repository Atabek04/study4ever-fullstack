package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Detailed module information including lesson data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDetailResponseDto {
    private Long id;
    private String title;
    private Integer sortOrder;
    private Long courseId;

    @Builder.Default
    private Set<LessonResponseDto> lessons = new HashSet<>();
}