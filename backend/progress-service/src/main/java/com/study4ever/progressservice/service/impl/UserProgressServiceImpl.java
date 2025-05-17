package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.CourseProgressSummaryDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;
import com.study4ever.progressservice.model.CourseProgress;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.model.StudyStreak;
import com.study4ever.progressservice.model.UserProgress;
import com.study4ever.progressservice.repository.CourseProgressRepository;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.repository.StudyStreakRepository;
import com.study4ever.progressservice.repository.UserProgressRepository;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProgressServiceImpl implements UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudyStreakRepository studyStreakRepository;
    private final CourseProgressRepository courseProgressRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProgressDto getUserProgress(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElse(null);
                
        if (userProgress == null) {
            log.info("User progress not found for user ID: {}. Initializing new progress.", userId);
            // Create and initialize new user progress since it doesn't exist
            UserProgress newUserProgress = UserProgress.builder()
                    .userId(userId)
                    .totalCompletedLessons(0)
                    .totalCompletedModules(0)
                    .totalCompletedCourses(0)
                    .totalStudyTimeMinutes(0L)
                    .lastActiveTimestamp(LocalDateTime.now())
                    .registrationDate(LocalDateTime.now())
                    .build();
                    
            UserProgress savedProgress = userProgressRepository.save(newUserProgress);
            log.info("User progress initialized for user ID: {}", userId);
            
            return ProgressMapper.mapToUserDto(savedProgress);
        }
        
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(null);
                
        return ProgressMapper.mapToUserDto(userProgress, streak);
    }

    @Override
    @Transactional
    public UserProgressDto initializeUserProgress(String userId) {
        log.info("Initializing user progress for user ID: {}", userId);
        
        // Check if user progress already exists
        if (userProgressRepository.existsById(userId)) {
            log.info("User progress already exists for user ID: {}", userId);
            return getUserProgress(userId);
        }
        
        // Create new user progress
        UserProgress userProgress = UserProgress.builder()
                .userId(userId)
                .totalCompletedLessons(0)
                .totalCompletedModules(0)
                .totalCompletedCourses(0)
                .totalStudyTimeMinutes(0L)
                .lastActiveTimestamp(LocalDateTime.now())
                .registrationDate(LocalDateTime.now())
                .build();
                
        UserProgress savedProgress = userProgressRepository.save(userProgress);
        log.info("User progress initialized for user ID: {}", userId);
        
        return ProgressMapper.mapToUserDto(savedProgress, null);
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatisticsDto getUserStatistics(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User progress not found for user ID: " + userId));
                
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(null);
                
        // Get study time by day of week for the last 30 days
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        List<StudySession> recentSessions = studySessionRepository.findByUserIdAndStartTimeBetween(
                userId, startDate, LocalDateTime.now());
                
        Map<String, Long> studyTimeByDay = calculateStudyTimeByDay(recentSessions);
        
        // Get recent courses (last 5 accessed)
        List<CourseProgress> recentCourses = courseProgressRepository.findByUserIdOrderByLastAccessDateDesc(userId)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
                
        List<CourseProgressSummaryDto> recentCourseSummaries = recentCourses.stream()
                .map(ProgressMapper::mapToCourseProgressSummary)
                .collect(Collectors.toList());
                
        // Calculate average completion rate
        Float averageCompletionRate = calculateAverageCompletionRate(recentCourses);
        
        return UserStatisticsDto.builder()
                .userId(userId)
                .totalStudyTimeMinutes(userProgress.getTotalStudyTimeMinutes())
                .totalCoursesEnrolled((int) courseProgressRepository.countByUserId(userId))
                .totalCoursesCompleted(userProgress.getTotalCompletedCourses())
                .totalModulesCompleted(userProgress.getTotalCompletedModules())
                .totalLessonsCompleted(userProgress.getTotalCompletedLessons())
                .averageCompletionRate(averageCompletionRate)
                .currentStreak(streak != null ? streak.getCurrentStreakDays() : 0)
                .longestStreak(streak != null ? streak.getLongestStreakDays() : 0)
                .studyTimeByDay(studyTimeByDay)
                .recentCourses(recentCourseSummaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStatisticsDto> getTopPerformingUsers(int limit) {
        // Get users with highest study time
        List<UserProgress> topUsers = userProgressRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalStudyTimeMinutes"))
        ).getContent();
        
        return topUsers.stream()
                .map(userProgress -> getUserStatistics(userProgress.getUserId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateLastLoginDate(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User progress not found for user ID: " + userId));
                
        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);
        
        log.info("Updated last login date for user ID: {}", userId);
    }
    
    private Map<String, Long> calculateStudyTimeByDay(List<StudySession> sessions) {
        Map<String, Long> studyTimeByDay = new HashMap<>();
        
        // Initialize days of week with zero minutes
        for (DayOfWeek day : DayOfWeek.values()) {
            studyTimeByDay.put(day.name(), 0L);
        }
        
        // Sum study time by day of week
        sessions.stream()
                .filter(session -> session.getDurationMinutes() != null)
                .forEach(session -> {
                    String dayOfWeek = session.getStartTime().getDayOfWeek().name();
                    Long currentMinutes = studyTimeByDay.getOrDefault(dayOfWeek, 0L);
                    studyTimeByDay.put(dayOfWeek, currentMinutes + session.getDurationMinutes());
                });
                
        return studyTimeByDay;
    }
    
    private Float calculateAverageCompletionRate(List<CourseProgress> courses) {
        if (courses.isEmpty()) {
            return 0.0f;
        }
        
        int totalCompletedLessons = 0;
        int totalLessons = 0;
        
        for (CourseProgress course : courses) {
            totalCompletedLessons += course.getCompletedLessonsCount();
            totalLessons += course.getTotalLessonsCount();
        }
        
        if (totalLessons == 0) {
            return 0.0f;
        }
        
        return (float) totalCompletedLessons / totalLessons * 100;
    }
}
