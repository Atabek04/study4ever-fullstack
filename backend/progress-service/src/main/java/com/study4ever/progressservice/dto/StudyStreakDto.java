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
public class StudyStreakDto {
    private String userId;
    private Integer currentStreakDays;
    private Integer longestStreakDays;
    private LocalDate lastStudyDate;
    private LocalDate streakStartDate;
}
