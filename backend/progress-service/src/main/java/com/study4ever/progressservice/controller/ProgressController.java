package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    @GetMapping
    public UserProgressDto getCurrentUserProgress() {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/statistics")
    public UserStatisticsDto getUserStatistics() {
        // Implementation will be added later
        return null;
    }
}
