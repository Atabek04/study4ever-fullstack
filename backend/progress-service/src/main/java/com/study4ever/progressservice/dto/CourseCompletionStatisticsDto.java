package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCompletionStatisticsDto {
    private String courseId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Map<LocalDate, Integer> completionsByDate;
}
