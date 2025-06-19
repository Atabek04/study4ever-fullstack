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
public class LeaderboardEntryDto {
    
    private String userId;
    private Long totalStudyMinutes;
    private Integer sessionCount;
    private Integer rank;
    private LocalDate periodStart;
    private LocalDate periodEnd;

}
