package com.study4ever.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {
    private UUID id;
    private String username;
    private String email;
    private boolean active;
}