package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.CourseCompletionStatisticsDto;
import com.study4ever.progressservice.dto.CourseProgressSummaryDto;
import com.study4ever.progressservice.dto.EnrollmentStatisticsDto;
import com.study4ever.progressservice.dto.UserProgressDto;

import java.time.LocalDate;
import java.util.List;

public interface AdminProgressService {

    List<UserProgressDto> getAllUserProgress(int page, int size);

    CourseProgressSummaryDto getCourseProgressSummary(String courseId);

    List<CourseProgressSummaryDto> getAllCourseProgressSummaries();

    EnrollmentStatisticsDto getNewEnrollmentsByDateRange(LocalDate startDate, LocalDate endDate);

    CourseCompletionStatisticsDto getCourseCompletionsByDateRange(String courseId, LocalDate startDate, LocalDate endDate);

    void resetUserProgress(String userId, String courseId);
}
