package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class CourseRequestDto {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long instructorId;

    private Set<Long> tagIds;
}