package com.study4ever.courseservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Builder
@Data
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;
    private Integer totalModules;
    private Integer totalLessons;
}