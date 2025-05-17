package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.StreakHistoryEntryDto;
import com.study4ever.progressservice.dto.StudyStreakDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/streaks")
@RequiredArgsConstructor
public class StudyStreakController {

    @GetMapping
    public StudyStreakDto getUserStreak() {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/history")
    public List<StreakHistoryEntryDto> getStreakHistory() {
        // Implementation will be added later
        return null;
    }
}
