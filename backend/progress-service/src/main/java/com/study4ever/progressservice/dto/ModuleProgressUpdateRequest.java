package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleProgressUpdateRequest {
    @NotNull(message = "Progress status is required")
    private ProgressStatusDto status;
}
