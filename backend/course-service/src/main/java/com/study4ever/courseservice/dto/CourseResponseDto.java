package com.study4ever.courseservice.dto;

import lombok.Data;

@Data
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private Long instructorId;
}