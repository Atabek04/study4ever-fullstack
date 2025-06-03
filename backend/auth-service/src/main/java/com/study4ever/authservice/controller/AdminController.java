package com.study4ever.authservice.controller;

import com.study4ever.authservice.dto.CreateInstructorRequest;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.dto.UserSummaryDto;
import com.study4ever.authservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    // Instructor Management Endpoints
    @PostMapping("/instructors")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createInstructor(@Valid @RequestBody CreateInstructorRequest request) {
        log.info("Received request to create instructor with username: {}", request.getUsername());
        return adminService.createInstructor(request);
    }

    @GetMapping("/instructors")
    public List<UserResponse> getAllInstructors() {
        log.info("Received request to get all instructors");
        return adminService.getAllInstructors();
    }

    @GetMapping("/instructors/{id}")
    public UserResponse getInstructorById(@PathVariable("id") String id) {
        log.info("Received request to get instructor with id: {}", id);
        return adminService.getInstructorById(UUID.fromString(id));
    }

    @DeleteMapping("/instructors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInstructor(@PathVariable("id") UUID id) {
        log.info("Received request to delete instructor with id: {}", id);
        adminService.deleteInstructor(id);
    }

    @GetMapping("/instructors/search")
    public List<UserResponse> searchInstructors(@RequestParam("q") String searchTerm) {
        log.info("Received request to search instructors with term: {}", searchTerm);
        return adminService.searchInstructors(searchTerm);
    }

    // Student Management Endpoints
    @GetMapping("/students")
    public List<UserResponse> getAllStudents() {
        log.info("Received request to get all students");
        return adminService.getAllStudents();
    }

    @GetMapping("/students/search")
    public List<UserResponse> searchStudents(@RequestParam("q") String searchTerm) {
        log.info("Received request to search students with term: {}", searchTerm);
        return adminService.searchStudents(searchTerm);
    }

    // General User Management Endpoints
    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        log.info("Received request to get all users");
        return adminService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public UserResponse getUserById(@PathVariable("id") String id) {
        log.info("Received request to get user with id: {}", id);
        return adminService.getUserById(UUID.fromString(id));
    }

    @GetMapping("/users/search")
    public List<UserResponse> searchUsers(@RequestParam("q") String searchTerm) {
        log.info("Received request to search users with term: {}", searchTerm);
        return adminService.searchUsers(searchTerm);
    }

    // Dashboard Summary Endpoint
    @GetMapping("/summary")
    public UserSummaryDto getUserSummary() {
        log.info("Received request to get user summary");
        return adminService.getUserSummary();
    }
}