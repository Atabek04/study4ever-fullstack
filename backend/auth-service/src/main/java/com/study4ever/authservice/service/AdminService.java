package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.CreateInstructorRequest;
import com.study4ever.authservice.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    UserResponse createInstructor(CreateInstructorRequest request);
    
    List<UserResponse> getAllInstructors();
    
    UserResponse getInstructorById(UUID id);
    
    void deleteInstructor(UUID id);
}