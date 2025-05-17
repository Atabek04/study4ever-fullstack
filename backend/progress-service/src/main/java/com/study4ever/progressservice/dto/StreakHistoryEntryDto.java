package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StreakHistoryEntryDto {
    private LocalDate date;
    private Integer streakDays;
    private Integer studyMinutes;
    private Boolean isActive;
}
