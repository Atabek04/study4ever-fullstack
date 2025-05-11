package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class CourseRequestDto {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private UUID instructorId;

    private Integer sortOrder;

    private Set<Long> tagIds = new HashSet<>();
}