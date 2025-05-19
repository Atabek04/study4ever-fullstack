package com.study4ever.courseservice.event;

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
public class StudySessionEndedEvent {
    private String userId;
    private UUID sessionId;
    private LocalDateTime timestamp;
}
