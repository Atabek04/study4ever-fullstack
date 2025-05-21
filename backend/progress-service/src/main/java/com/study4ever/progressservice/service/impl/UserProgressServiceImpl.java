package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.exception.NotFoundException;
import com.study4ever.progressservice.model.StudyStreak;
import com.study4ever.progressservice.model.UserProgress;
import com.study4ever.progressservice.repository.StudyStreakRepository;
import com.study4ever.progressservice.repository.UserProgressRepository;
import com.study4ever.progressservice.service.UserProgressService;
import com.study4ever.progressservice.util.ProgressMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProgressServiceImpl implements UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final StudyStreakRepository studyStreakRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProgressDto getUserProgress(String userId) {
        UserProgress userProgress = userProgressRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(null);

        return ProgressMapper.mapToUserDto(userProgress, streak);
    }

    @Override
    @Transactional
    public void updateLastLoginDate(String userId) {
        UserProgress userProgress = userProgressRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));

        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);

        log.info("Updated last login date for user ID: {}", userId);
    }

    @Override
    public void logStudySession(String userId, int studyTimeMinutes) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));

        userProgress.setTotalStudyTimeMinutes(userProgress.getTotalStudyTimeMinutes() + studyTimeMinutes);
        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);

        log.info("Logged study session for user ID: {}. Added {} minutes.", userId, studyTimeMinutes);
    }

    @Override
    public void increaseCompletedLessonsCount(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));

        userProgress.setTotalCompletedLessons(userProgress.getTotalCompletedLessons() + 1);
        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);

        log.info("Increased completed lessons count for user ID: {}", userId);
    }

    @Override
    public void increaseCompletedModulesCount(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));

        userProgress.setTotalCompletedModules(userProgress.getTotalCompletedModules() + 1);
        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);

        log.info("Increased completed modules count for user ID: {}", userId);
    }

    @Override
    public void increaseCompletedCoursesCount(String userId) {
        UserProgress userProgress = userProgressRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User progress not found for user ID: " + userId));

        userProgress.setTotalCompletedCourses(userProgress.getTotalCompletedCourses() + 1);
        userProgress.setLastActiveTimestamp(LocalDateTime.now());
        userProgressRepository.save(userProgress);

        log.info("Increased completed courses count for user ID: {}", userId);

    }
}
