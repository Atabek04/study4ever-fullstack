package com.study4ever.progressservice.service.impl;

import com.study4ever.progressservice.dto.StreakHistoryEntryDto;
import com.study4ever.progressservice.dto.StudyStreakDto;
import com.study4ever.progressservice.model.StudySession;
import com.study4ever.progressservice.model.StudyStreak;
import com.study4ever.progressservice.repository.StudySessionRepository;
import com.study4ever.progressservice.repository.StudyStreakRepository;
import com.study4ever.progressservice.service.StudyStreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyStreakServiceImpl implements StudyStreakService {

    private final StudyStreakRepository studyStreakRepository;
    private final StudySessionRepository studySessionRepository;

    @Override
    @Transactional(readOnly = true)
    public StudyStreakDto getUserStreak(String userId) {
        return mapToDto(studyStreakRepository.findById(userId)
                .orElse(createInitialStreak(userId)));
    }

    @Override
    @Transactional
    public void updateStreak(String userId) {
        LocalDate today = LocalDate.now();
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(createInitialStreak(userId));
        LocalDate lastStudyDate = streak.getLastStudyDate();

        if (lastStudyDate.equals(today)) {
            log.debug("User {} already has a streak update for today. No changes needed.", userId);
            return;
        }

        if (lastStudyDate.equals(today.minusDays(1))) {
            log.info("Incrementing streak for user {} from {} days", userId, streak.getCurrentStreakDays());
            streak.setCurrentStreakDays(streak.getCurrentStreakDays() + 1);

            if (streak.getCurrentStreakDays() > streak.getLongestStreakDays()) {
                streak.setLongestStreakDays(streak.getCurrentStreakDays());
            }
        } else if (lastStudyDate.isBefore(today.minusDays(1))) {
            log.info("Resetting streak for user {} as last study date was {}", userId, lastStudyDate);
            streak.setCurrentStreakDays(1);
            streak.setStreakStartDate(today);
        }

        streak.setLastStudyDate(today);
        studyStreakRepository.save(streak);
    }

    @Override
    @Transactional
    public void resetStreak(String userId) {
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(createInitialStreak(userId));

        LocalDate today = LocalDate.now();
        streak.setCurrentStreakDays(0);
        streak.setLastStudyDate(today);
        streak.setStreakStartDate(today);

        studyStreakRepository.save(streak);
        log.info("Reset streak for user {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StreakHistoryEntryDto> getStreakHistoryByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<StudySession> sessions = studySessionRepository.findByUserIdAndStartTimeBetween(
                userId, startDateTime, endDateTime);

        Map<LocalDate, Integer> studyMinutesByDate = sessions.stream()
                .filter(s -> s.getDurationMinutes() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getStartTime().toLocalDate(),
                        Collectors.summingInt(StudySession::getDurationMinutes)
                ));

        List<StreakHistoryEntryDto> history = new ArrayList<>();
        LocalDate date = startDate;
        int runningStreakCount = 0;

        while (!date.isAfter(endDate)) {
            boolean isActive = studyMinutesByDate.containsKey(date);
            runningStreakCount = isActive ? runningStreakCount + 1 : 0;

            StreakHistoryEntryDto entry = new StreakHistoryEntryDto();
            entry.setDate(date);
            entry.setStreakDays(runningStreakCount);
            entry.setStudyMinutes(studyMinutesByDate.getOrDefault(date, 0));
            entry.setIsActive(isActive);

            history.add(entry);

            date = date.plusDays(1);
        }

        return history;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyStreakDto> getTopStreaks(int limit) {
        return studyStreakRepository.findAll(
                        PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "currentStreakDays"))
                ).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public void updateLastStudyDateToday(String userId) {
        StudyStreak streak = studyStreakRepository.findById(userId)
                .orElse(createInitialStreak(userId));

        streak.setLastStudyDate(LocalDate.now());
        studyStreakRepository.save(streak);

        log.info("Updated last study date for user {}", userId);
    }

    /**
     * Scheduled job to check and reset streaks for users who haven't studied in the last 24 hours
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    @Transactional
    public void checkAndResetExpiredStreaks() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        List<StudyStreak> expiredStreaks = studyStreakRepository.findByLastStudyDateBefore(yesterday);

        for (StudyStreak streak : expiredStreaks) {
            log.info("Breaking streak for user {} who hasn't studied since {}",
                    streak.getUserId(), streak.getLastStudyDate());

            streak.setCurrentStreakDays(0);
            streak.setStreakStartDate(LocalDate.now());
        }

        if (!expiredStreaks.isEmpty()) {
            studyStreakRepository.saveAll(expiredStreaks);
            log.info("Reset {} expired streaks", expiredStreaks.size());
        }
    }

    @Override
    public StudyStreak createInitialStreak(String userId) {
        StudyStreak streak = StudyStreak.builder()
                .userId(userId)
                .currentStreakDays(0)
                .longestStreakDays(0)
                .lastStudyDate(LocalDate.now())
                .streakStartDate(LocalDate.now())
                .build();

        return studyStreakRepository.save(streak);
    }

    private StudyStreakDto mapToDto(StudyStreak streak) {
        return StudyStreakDto.builder()
                .userId(streak.getUserId())
                .currentStreakDays(streak.getCurrentStreakDays())
                .longestStreakDays(streak.getLongestStreakDays())
                .lastStudyDate(streak.getLastStudyDate())
                .streakStartDate(streak.getStreakStartDate())
                .build();
    }
}
