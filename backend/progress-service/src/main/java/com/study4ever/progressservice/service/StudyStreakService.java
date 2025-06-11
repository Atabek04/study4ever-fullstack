package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.StreakHistoryEntryDto;
import com.study4ever.progressservice.dto.StudyStreakDto;

import java.time.LocalDate;
import java.util.List;

public interface StudyStreakService {

    StudyStreakDto getUserStreak(String userId);

    void updateStreak(String userId);

    void resetStreak(String userId);

    List<StreakHistoryEntryDto> getStreakHistoryByDateRange(String userId, LocalDate startDate, LocalDate endDate);

    List<StudyStreakDto> getTopStreaks(int limit);

    void updateLastStudyDateToday(String userId);

    StudyStreakDto createInitialStreak(String userId);
}
