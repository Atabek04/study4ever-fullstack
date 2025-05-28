package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeartbeatRequest {
    private UUID sessionId;
    private String moduleId;
    private String lessonId;
}
