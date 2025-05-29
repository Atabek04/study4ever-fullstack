package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatsDto {
    private String month; // e.g., "JANUARY", "FEBRUARY"
    private Integer monthNumber; // 1-12
    private Integer year;
    private Long durationMinutes;
    private Integer sessionCount;
}
