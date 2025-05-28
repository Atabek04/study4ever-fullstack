package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.HeartbeatRequest;
import com.study4ever.progressservice.dto.StartStudySessionRequest;
import com.study4ever.progressservice.dto.StudySessionDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface StudySessionService {

    StudySessionDto startStudySession(String userId, StartStudySessionRequest request);

    StudySessionDto endStudySession(String userId, UUID sessionId);

    StudySessionDto getStudySession(String userId, UUID sessionId);

    List<StudySessionDto> getUserStudySessions(String userId);

    List<StudySessionDto> getUserStudySessionsByDate(String userId, LocalDate date);

    List<StudySessionDto> getUserStudySessionsByDateRange(String userId, LocalDate startDate, LocalDate endDate);

    List<StudySessionDto> getAllActiveSessions();

    StudySessionDto getActiveUserSession(String userId);

    void deleteStudySession(String userId, UUID sessionId);

    void updateSessionLocation(HeartbeatRequest request);

    void cleanupExpiredSessions();

    List<StudySessionDto> findExpiredActiveSessions();
}
