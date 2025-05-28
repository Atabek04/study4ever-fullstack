package com.study4ever.progressservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * DTO for module details received from Course Service.
 * Maps to ModuleDetailResponseDto from Course Service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDto {
    private Long id;
    private String title;
    private Integer sortOrder;
    private Long courseId;

    @Builder.Default
    private Set<LessonDto> lessons = new HashSet<>();
}
