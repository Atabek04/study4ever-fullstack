package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.CourseProgressSummaryDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AdminProgressService {
    
    List<UserProgressDto> getAllUserProgress(int page, int size);
    
    List<UserStatisticsDto> getAllUserStatistics(int page, int size);
    
    CourseProgressSummaryDto getCourseProgressSummary(String courseId);
    
    List<CourseProgressSummaryDto> getAllCourseProgressSummaries();
    
    Map<LocalDate, Integer> getNewEnrollmentsByDateRange(LocalDate startDate, LocalDate endDate);
    
    Map<LocalDate, Integer> getCourseCompletionsByDateRange(String courseId, LocalDate startDate, LocalDate endDate);
    
    void resetUserProgress(String userId, String courseId);
}
