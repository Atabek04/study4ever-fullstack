package com.study4ever.courseservice.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudySessionResponse {
    private String sessionId;
    private Instant startTime;
}
