package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatsDto {
    private LocalDate date;
    private String dayOfWeek;
    private Long durationMinutes;
    private Integer sessionCount;
    private Double percentageChange;
}
