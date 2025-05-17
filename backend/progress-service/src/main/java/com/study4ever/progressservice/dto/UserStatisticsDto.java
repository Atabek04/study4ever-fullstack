package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsDto {
    private String userId;
    private String username;
    private Long totalStudyTimeMinutes;
    private Integer totalCoursesEnrolled;
    private Integer totalCoursesCompleted;
    private Integer totalModulesCompleted;
    private Integer totalLessonsCompleted;
    private Float averageCompletionRate;
    private Integer currentStreak;
    private Integer longestStreak;
    private Map<String, Long> studyTimeByDay;
    private List<CourseProgressSummaryDto> recentCourses;
}
