package com.study4ever.courseservice.event.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Event sent from progress-service to confirm session status changes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionConfirmationEvent {
    private UUID sessionId;
    private String userId;
    private String action; // "started", "ended", "heartbeat"
    private boolean success;
    private String message;
}
