package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.SessionStatisticsDto;
import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionDto startStudySession(@RequestBody StartStudySessionRequest request) {
        // Implementation will be added later
        return null;
    }

    @PutMapping("/{sessionId}/end")
    public StudySessionDto endStudySession(@PathVariable String sessionId) {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/active")
    public StudySessionDto getActiveSession() {
        // Implementation will be added later
        return null;
    }

    @GetMapping
    public List<StudySessionDto> getSessionHistory() {
        // Implementation will be added later
        return null;
    }

    @GetMapping("/statistics")
    public SessionStatisticsDto getSessionStatistics() {
        // Implementation will be added later
        return null;
    }
}
