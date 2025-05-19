package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartStudySessionRequest {
    private String courseId;
    private String moduleId;
    private String lessonId;
}
