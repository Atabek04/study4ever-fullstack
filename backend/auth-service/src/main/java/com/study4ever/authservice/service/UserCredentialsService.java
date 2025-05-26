package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.UserResponse;

public interface UserCredentialsService {

    UserResponse getProfile(String userId);
}
