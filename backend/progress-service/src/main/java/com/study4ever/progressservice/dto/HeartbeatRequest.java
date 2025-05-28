package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeartbeatRequest {
    private UUID sessionId;
    private String moduleId;
    private String lessonId;
}
