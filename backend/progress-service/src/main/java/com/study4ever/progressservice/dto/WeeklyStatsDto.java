package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyStatsDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private String weekLabel; // e.g., "Week of May 26, 2025"
    private List<DailyStatsDto> dailyStats;
    private Long totalDurationMinutes;
    private Integer totalSessionCount;
    private Double percentageChange;
}
