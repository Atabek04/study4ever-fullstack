package com.study4ever.courseservice.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private UUID instructorId;
}