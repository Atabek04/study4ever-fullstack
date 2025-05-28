package com.study4ever.progressservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * DTO for course details received from Course Service.
 * Maps to CourseDetailResponseDto from Course Service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailsDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;

    @Builder.Default
    private Set<ModuleDto> modules = new HashSet<>();

    @Builder.Default
    private Set<Long> tagIds = new HashSet<>();
}
