package com.study4ever.courseservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudySessionRequest {

    private String userId;
    private String courseId;
    private String moduleId;
    private String lessonId;
}
