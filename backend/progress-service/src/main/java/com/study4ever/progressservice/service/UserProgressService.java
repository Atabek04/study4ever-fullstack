package com.study4ever.progressservice.service;

import com.study4ever.progressservice.dto.UserProgressDto;

public interface UserProgressService {

    UserProgressDto getUserProgress(String userId);

    void updateLastLoginDate(String userId);
}
