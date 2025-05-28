package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartStudySessionRequest {
    private String userId;
    private String courseId;
    private String moduleId;
    private String lessonId;
}
