package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.CourseProgressSummaryDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.ProgressStatus;
import com.study4ever.progressservice.model.UserProgress;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.UserProgressRepository;
import com.study4ever.progressservice.service.AdminProgressService;
import com.study4ever.progressservice.service.CourseProgressService;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProgressServiceImpl implements AdminProgressService {

    private final UserProgressRepository userProgressRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final UserProgressService userProgressService;
    private final CourseProgressService courseProgressService;

    @Override
    @Transactional(readOnly = true)
    public List<UserProgressDto> getAllUserProgress(int page, int size) {
        Page<String> userIds = userProgressRepository.findAll(
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastActiveTimestamp")))
                .map(UserProgress::getUserId);

        return userIds.stream()
                .map(userProgressService::getUserProgress)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStatisticsDto> getAllUserStatistics(int page, int size) {
        Page<String> userIds = userProgressRepository.findAll(
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastActiveTimestamp")))
                .map(UserProgress::getUserId);

        return userIds.stream()
                .map(userProgressService::getUserStatistics)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressSummaryDto getCourseProgressSummary(String courseId) {
        List<CourseProgress> courseProgresses = courseProgressRepository.findByCourseId(courseId);

        if (courseProgresses.isEmpty()) {
            log.warn("No progress data found for course ID: {}", courseId);
            return CourseProgressSummaryDto.builder()
                    .courseId(courseId)
                    .completionPercentage(0f)
                    .build();
        }

        CourseProgress firstProgress = courseProgresses.get(0);
        String courseTitle = firstProgress.getCourseTitle();

        int totalEnrollments = courseProgresses.size();
        long totalCompleted = courseProgresses.stream()
                .filter(cp -> Boolean.TRUE.equals(cp.getCompleted()))
                .count();

        float completionRate = (float) totalCompleted / totalEnrollments * 100;

        // Find the most recent access date
        LocalDateTime lastAccessDate = courseProgresses.stream()
                .map(CourseProgress::getLastAccessDate)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return CourseProgressSummaryDto.builder()
                .courseId(courseId)
                .courseTitle(courseTitle)
                .status(ProgressMapper.mapStatus(mostFrequentStatus(courseProgresses)))
                .completionPercentage(completionRate)
                .lastAccessDate(lastAccessDate)
                .build();
    }

    private ProgressStatus mostFrequentStatus(List<CourseProgress> progresses) {
        Map<ProgressStatus, Long> statusCounts = progresses.stream()
                .collect(Collectors.groupingBy(CourseProgress::getStatus, Collectors.counting()));

        return statusCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(ProgressStatus.NOT_STARTED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseProgressSummaryDto> getAllCourseProgressSummaries() {
        // Get unique course IDs
        List<String> courseIds = courseProgressRepository.findDistinctCourseIds();

        return courseIds.stream()
                .map(this::getCourseProgressSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<LocalDate, Integer> getNewEnrollmentsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<CourseProgress> enrollments = courseProgressRepository.findByCreatedDateBetween(
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay().minusSeconds(1));

        Map<LocalDate, Integer> enrollmentsByDate = new HashMap<>();

        // Initialize all dates in range with zero
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            enrollmentsByDate.put(date, 0);
            date = date.plusDays(1);
        }

        // Count enrollments by date
        for (CourseProgress enrollment : enrollments) {
            LocalDate enrollmentDate = enrollment.getCreatedAt().toLocalDate();
            enrollmentsByDate.put(enrollmentDate, enrollmentsByDate.getOrDefault(enrollmentDate, 0) + 1);
        }

        return enrollmentsByDate;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<LocalDate, Integer> getCourseCompletionsByDateRange(String courseId, LocalDate startDate, LocalDate endDate) {
        List<CourseProgress> completions = courseProgressRepository.findByCourseIdAndCompletedAndCompletionDateBetween(
                courseId, true, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay().minusSeconds(1));

        Map<LocalDate, Integer> completionsByDate = new HashMap<>();

        // Initialize all dates in range with zero
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            completionsByDate.put(date, 0);
            date = date.plusDays(1);
        }

        // Count completions by date
        for (CourseProgress completion : completions) {
            if (completion.getCompletionDate() != null) {
                LocalDate completionDate = completion.getCompletionDate().toLocalDate();
                completionsByDate.put(completionDate, completionsByDate.getOrDefault(completionDate, 0) + 1);
            }
        }

        return completionsByDate;
    }

    @Override
    @Transactional
    public void resetUserProgress(String userId, String courseId) {
        log.info("Resetting progress for user {} in course {}", userId, courseId);

        if (courseId == null) {
            // Reset all course progress for user
            List<CourseProgress> userCourses = courseProgressRepository.findByUserId(userId);

            for (CourseProgress course : userCourses) {
                courseProgressService.resetCourseProgress(userId, course.getCourseId());
            }
        } else {
            // Reset specific course progress
            courseProgressService.resetCourseProgress(userId, courseId);
        }

        log.info("Progress reset completed for user {}", userId);
    }
}
