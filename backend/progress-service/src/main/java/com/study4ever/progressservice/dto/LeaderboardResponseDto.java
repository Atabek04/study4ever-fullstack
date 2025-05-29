package com.study4ever.progressservice.dto;

import com.study4ever.progressservice.model.PeriodType;
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
public class LeaderboardResponseDto {
    
    private List<LeaderboardEntryDto> entries;
    private LocalDate startDate;
    private LocalDate endDate;
    private PeriodType periodType;
    private Integer totalEntries;
    private LeaderboardEntryDto currentUserRanking;
    private Long lastUpdated; // Unix timestamp
    
    public static LeaderboardResponseDto empty(LocalDate startDate, LocalDate endDate, PeriodType periodType) {
        return LeaderboardResponseDto.builder()
                .entries(List.of())
                .startDate(startDate)
                .endDate(endDate)
                .periodType(periodType)
                .totalEntries(0)
                .lastUpdated(System.currentTimeMillis())
                .build();
    }
}
