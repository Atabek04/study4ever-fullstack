package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentRequest {
    @NotBlank(message = "Course ID is required")
    private String courseId;
    
    private String courseTitle;
}
