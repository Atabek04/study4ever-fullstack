package com.study4ever.progressservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgressDto {
    private String userId;
    private Integer totalCompletedLessons;
    private Integer totalCompletedModules;
    private Integer totalCompletedCourses;
    private Long totalStudyTimeMinutes;
    private LocalDateTime lastActiveTimestamp;
    private LocalDateTime registrationDate;
    private Integer currentStreak;
    private Integer longestStreak;
}
