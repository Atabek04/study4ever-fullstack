package com.study4ever.courseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdatedEvent {
    private UUID id;
    private String username;
    private String email;
    private boolean active;
}