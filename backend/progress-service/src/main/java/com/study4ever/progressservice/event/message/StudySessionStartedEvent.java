package com.study4ever.progressservice.event.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionStartedEvent {
    private String userId;
    private String courseId;
    private String moduleId;
    private String lessonId;
    private LocalDateTime timestamp;
}
