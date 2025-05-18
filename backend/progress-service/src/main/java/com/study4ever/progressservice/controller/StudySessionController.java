package com.study4ever.progressservice.controller;

import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;
import com.study4ever.progressservice.service.StudySessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
@Slf4j
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionDto startStudySession(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody StartStudySessionRequest request) {
        log.debug("Starting study session for user {} with course: {}, module: {}, lesson: {}",
                userId, request.getCourseId(), request.getModuleId(), request.getLessonId());
        return studySessionService.startStudySession(userId, request);
    }

    @PutMapping("/{sessionId}/end")
    public StudySessionDto endStudySession(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID sessionId) {
        log.debug("Ending study session {} for user {}", sessionId, userId);
        return studySessionService.endStudySession(userId, sessionId);
    }

    @GetMapping("/{sessionId}")
    public StudySessionDto getStudySession(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID sessionId) {
        log.debug("Getting study session {} for user {}", sessionId, userId);
        return studySessionService.getStudySession(userId, sessionId);
    }

    @GetMapping
    public List<StudySessionDto> getUserStudySessions(
            @RequestHeader("X-User-Id") String userId) {
        log.debug("Getting all study sessions for user {}", userId);
        return studySessionService.getUserStudySessions(userId);
    }

    @GetMapping("/by-date")
    public List<StudySessionDto> getUserStudySessionsByDate(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.debug("Getting study sessions for user {} on date {}", userId, date);
        return studySessionService.getUserStudySessionsByDate(userId, date);
    }

    @GetMapping("/by-date-range")
    public List<StudySessionDto> getUserStudySessionsByDateRange(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Getting study sessions for user {} from {} to {}", userId, startDate, endDate);
        return studySessionService.getUserStudySessionsByDateRange(userId, startDate, endDate);
    }

    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudySession(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID sessionId) {
        log.debug("Deleting study session {} for user {}", sessionId, userId);
        studySessionService.deleteStudySession(userId, sessionId);
    }
}
