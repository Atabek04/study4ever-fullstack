package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.model.UserProgress;
import com.study4ever.progressservice.repository.UserProgressRepository;
import com.study4ever.progressservice.service.UserProgressInitializeService;
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
public class UserProgressInitializeServiceImpl implements UserProgressInitializeService {

    private final UserProgressRepository userProgressRepository;
    private final UserProgressService userProgressService;

    @Override
    @Transactional
    public void initializeUserProgress(String userId) {
        log.info("Initializing user progress for user ID: {}", userId);

        if (userProgressRepository.existsById(userId)) {
            log.info("User progress already exists for user ID: {}", userId);
            userProgressService.getUserProgress(userId);
            return;
        }

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

        ProgressMapper.mapToUserDto(savedProgress, null);
    }
}
