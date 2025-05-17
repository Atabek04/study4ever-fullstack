package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.SessionStatisticsDto;
import com.study4ever.progressservice.dto.UserProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminProgressController {

    @GetMapping("/progress/{userId}")
    public UserProgressDto getUserProgress(@PathVariable String userId) {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/progress/users")
    public Map<String, Object> getAllUsersProgressStatistics() {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/progress/courses/{courseId}")
    public Map<String, Object> getCourseProgressStatistics(@PathVariable String courseId) {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/sessions/statistics")
    public SessionStatisticsDto getGlobalSessionStatistics() {
        // Implementation will be added later
        return null;
    }
}
