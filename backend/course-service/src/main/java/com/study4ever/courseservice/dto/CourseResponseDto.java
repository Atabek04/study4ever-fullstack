package com.study4ever.courseservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;
}