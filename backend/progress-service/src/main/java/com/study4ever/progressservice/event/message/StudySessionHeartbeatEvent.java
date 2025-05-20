package com.study4ever.progressservice.event.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionHeartbeatEvent {
    private String userId;
    private UUID sessionId;
    private String courseId;
    private String moduleId;
    private String lessonId;
    private LocalDateTime timestamp;
}
