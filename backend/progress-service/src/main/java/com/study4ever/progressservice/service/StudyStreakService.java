package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.StreakHistoryEntryDto;
import com.study4ever.progressservice.dto.StudyStreakDto;
import com.study4ever.progressservice.model.StudyStreak;

import java.time.LocalDate;
import java.util.List;

public interface StudyStreakService {

    StudyStreakDto getUserStreak(String userId);

    void updateStreak(String userId);

    void resetStreak(String userId);

    List<StreakHistoryEntryDto> getStreakHistoryByDateRange(String userId, LocalDate startDate, LocalDate endDate);

    List<StudyStreakDto> getTopStreaks(int limit);

    void updateLastStudyDateToday(String userId);

    StudyStreak createInitialStreak(String userId);
}
