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
}
