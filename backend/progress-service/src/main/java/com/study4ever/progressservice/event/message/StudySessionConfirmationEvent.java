package com.study4ever.progressservice.event.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionConfirmationEvent {
    private UUID sessionId;
    private String userId;
    private String type; // started, ended, heartbeat
    private boolean success;
    private String message;
}
