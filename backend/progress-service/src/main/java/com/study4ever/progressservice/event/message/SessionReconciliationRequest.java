package com.study4ever.progressservice.event.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionReconciliationRequest {
    private String userId;
    private List<UUID> sessionIds;
}
