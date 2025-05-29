package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YearlyStatsDto {
    private Integer year;
    private List<MonthlyStatsDto> monthlyStats;
    private Long totalDurationMinutes;
    private Integer totalSessionCount;
}
