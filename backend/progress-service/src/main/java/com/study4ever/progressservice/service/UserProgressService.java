package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.UserProgressDto;
import com.study4ever.progressservice.dto.UserStatisticsDto;

import java.util.List;

public interface UserProgressService {
    
    UserProgressDto getUserProgress(String userId);
    
    UserProgressDto initializeUserProgress(String userId);
    
    UserStatisticsDto getUserStatistics(String userId);
    
    List<UserStatisticsDto> getTopPerformingUsers(int limit);
    
    void updateLastLoginDate(String userId);
}
