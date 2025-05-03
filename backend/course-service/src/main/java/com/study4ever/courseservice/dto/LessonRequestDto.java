package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class LessonRequestDto {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String videoUrl;

    @Positive
    @NotNull
    private Integer durationMinutes;

    @Positive
    @NotNull
    private Integer sortOrder;

    @NotNull
    private Long moduleId;
}