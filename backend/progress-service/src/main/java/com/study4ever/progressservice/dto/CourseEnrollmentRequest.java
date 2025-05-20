package com.study4ever.progressservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentRequest {

    @NotNull(message = "Total lessons count is required")
    private Integer totalLessonsCount;

    @NotNull(message = "Total modules count is required")
    private Integer totalModulesCount;
}
