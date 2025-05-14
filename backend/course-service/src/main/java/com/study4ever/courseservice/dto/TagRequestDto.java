package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagRequestDto {

    @NotBlank
    private String name;
}