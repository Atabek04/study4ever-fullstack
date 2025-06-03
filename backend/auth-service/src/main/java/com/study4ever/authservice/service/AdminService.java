package com.study4ever.authservice.service;

import com.study4ever.authservice.dto.CreateInstructorRequest;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.dto.UserSummaryDto;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    UserResponse createInstructor(CreateInstructorRequest request);

    List<UserResponse> getAllInstructors();

    UserResponse getInstructorById(UUID id);

    void deleteInstructor(UUID id);

    // User management methods
    List<UserResponse> getAllStudents();
    
    List<UserResponse> getAllUsers();
    
    UserResponse getUserById(UUID id);
    
    UserSummaryDto getUserSummary();
    
    List<UserResponse> searchUsers(String searchTerm);
    
    List<UserResponse> searchStudents(String searchTerm);
    
    List<UserResponse> searchInstructors(String searchTerm);
}