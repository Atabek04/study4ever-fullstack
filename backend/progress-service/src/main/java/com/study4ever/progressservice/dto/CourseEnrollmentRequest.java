package com.study4ever.progressservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentRequest {

    @NotBlank(message = "Course ID is required")
    private String courseId;

    @NotBlank(message = "Course title is required")
    private String courseTitle;
}
