package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionStatisticsDto {
    private Long totalStudyTimeMinutes;
    private Integer totalSessions;
    private Double averageSessionDurationMinutes;
    private Map<String, Long> studyTimeByDay;
    private Map<String, Long> studyTimeByCourse;
    private Integer activeDaysInLastMonth;
    private String mostStudiedCourseId;
    private String mostStudiedCourseTitle;
    private Long mostProductiveHour;
}
