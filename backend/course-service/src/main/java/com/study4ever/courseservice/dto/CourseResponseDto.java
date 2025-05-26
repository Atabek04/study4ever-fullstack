package com.study4ever.courseservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Builder
@Data
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;
    private String instructorFirstName;
    private String instructorLastName;
    private Integer totalModules;
    private Integer totalLessons;
    
    @Builder.Default
    private Set<Long> tagIds = new HashSet<>();
}