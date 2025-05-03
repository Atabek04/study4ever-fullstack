package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ModuleRequestDto {

    @NotBlank
    private String title;

    @Positive
    @NotNull
    private Integer sortOrder;

    @NotNull
    private Long courseId;
}