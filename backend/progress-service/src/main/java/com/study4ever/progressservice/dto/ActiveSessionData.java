package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSessionData {
    private String moduleId;
    private String lessonId;
    private Instant startTime;
    private Instant lastActivityTime;
    
    public ActiveSessionData(String moduleId, String lessonId, Instant startTime) {
        this.moduleId = moduleId;
        this.lessonId = lessonId;
        this.startTime = startTime;
        this.lastActivityTime = startTime;
    }
}
