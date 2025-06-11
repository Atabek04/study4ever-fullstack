package com.study4ever.authservice.service.impl;

import com.study4ever.authservice.dto.CreateInstructorRequest;
import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserDeletedEvent;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.dto.UserSummaryDto;
import com.study4ever.authservice.exception.EmailAlreadyExistsException;
import com.study4ever.authservice.exception.NotFoundException;
import com.study4ever.authservice.exception.UsernameAlreadyExistsException;
import com.study4ever.authservice.model.Role;
import com.study4ever.authservice.model.UserCredentials;
import com.study4ever.authservice.repo.RoleRepository;
import com.study4ever.authservice.repo.UserCredentialsRepository;
import com.study4ever.authservice.service.AdminService;
import com.study4ever.authservice.service.UserEventProducer;
import com.study4ever.authservice.util.Mapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserCredentialsRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventProducer userEventProducer;

    @Override
    @Transactional
    public UserResponse createInstructor(CreateInstructorRequest request) {
        log.info("Creating instructor with username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use");
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Role not found")));
        roles.add(roleRepository.findByName(Role.RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new NotFoundException("Role not found")));

        UserCredentials instructor = UserCredentials.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .isAccountNonExpired(true)
                .isAccountNonLocked(true)
                .isCredentialsNonExpired(true)
                .isEnabled(true)
                .build();

        UserCredentials savedInstructor = userRepository.save(instructor);

        sendUserCreatedEvent(savedInstructor);

        log.info("Instructor created successfully with id: {}", savedInstructor.getId());

        return Mapper.mapToUserResponse(savedInstructor);
    }

    @Override
    public List<UserResponse> getAllInstructors() {
        log.info("Fetching all instructors");

        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        List<UserCredentials> instructors = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(instructorRole))
                .toList();

        return instructors.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse getInstructorById(UUID id) {
        log.info("Fetching instructor with id: {}", id);

        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        UserCredentials instructor = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Instructor not found"));

        if (!instructor.getRoles().contains(instructorRole)) {
            throw new NotFoundException("Instructor role not found");
        }

        return Mapper.mapToUserResponse(instructor);
    }

    @Override
    @Transactional
    public void deleteInstructor(UUID id) {
        log.info("Deleting instructor with id: {}", id);

        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        UserCredentials instructor = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Instructor not found"));

        if (!instructor.getRoles().contains(instructorRole)) {
            throw new NotFoundException("Instructor role not found");
        }

        userRepository.delete(instructor);
        sendUserDeletedEvent(instructor);

        log.info("Instructor deleted successfully: {}", id);
    }

    @Override
    public List<UserResponse> getAllStudents() {
        log.info("Fetching all students");

        Role studentRole = roleRepository.findByName(Role.RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new NotFoundException("Student role not found"));
        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        List<UserCredentials> students = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(studentRole) && !user.getRoles().contains(instructorRole))
                .toList();

        return students.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users");

        List<UserCredentials> users = userRepository.findAll();

        return users.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(UUID id) {
        log.info("Fetching user with id: {}", id);

        UserCredentials user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return Mapper.mapToUserResponse(user);
    }

    @Override
    public UserSummaryDto getUserSummary() {
        log.info("Fetching user summary");

        Role studentRole = roleRepository.findByName(Role.RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new NotFoundException("Student role not found"));
        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        List<UserCredentials> allUsers = userRepository.findAll();

        long totalUsers = allUsers.size();
        long totalStudents = allUsers.stream()
                .filter(user -> user.getRoles().contains(studentRole) && !user.getRoles().contains(instructorRole))
                .count();
        long totalInstructors = allUsers.stream()
                .filter(user -> user.getRoles().contains(instructorRole))
                .count();
        long activeUsers = allUsers.stream()
                .filter(UserCredentials::isEnabled)
                .count();
        long inactiveUsers = totalUsers - activeUsers;

        return UserSummaryDto.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .build();
    }

    @Override
    public List<UserResponse> searchUsers(String searchTerm) {
        log.info("Searching users with term: {}", searchTerm);

        List<UserCredentials> users = userRepository.findAll().stream()
                .filter(user -> matchesSearchTerm(user, searchTerm))
                .toList();

        return users.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    @Override
    public List<UserResponse> searchStudents(String searchTerm) {
        log.info("Searching students with term: {}", searchTerm);

        Role studentRole = roleRepository.findByName(Role.RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new NotFoundException("Student role not found"));
        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        List<UserCredentials> students = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(studentRole) && !user.getRoles().contains(instructorRole))
                .filter(user -> matchesSearchTerm(user, searchTerm))
                .toList();

        return students.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    @Override
    public List<UserResponse> searchInstructors(String searchTerm) {
        log.info("Searching instructors with term: {}", searchTerm);

        Role instructorRole = roleRepository.findByName(Role.RoleName.ROLE_INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Instructor role not found"));

        List<UserCredentials> instructors = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(instructorRole))
                .filter(user -> matchesSearchTerm(user, searchTerm))
                .toList();

        return instructors.stream()
                .map(Mapper::mapToUserResponse)
                .toList();
    }

    private boolean matchesSearchTerm(UserCredentials user, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return true;
        }
        
        String lowerSearchTerm = searchTerm.toLowerCase().trim();
        return user.getUsername().toLowerCase().contains(lowerSearchTerm) ||
               user.getEmail().toLowerCase().contains(lowerSearchTerm) ||
               user.getFirstName().toLowerCase().contains(lowerSearchTerm) ||
               user.getLastName().toLowerCase().contains(lowerSearchTerm) ||
               (user.getFirstName() + " " + user.getLastName()).toLowerCase().contains(lowerSearchTerm);
    }

    private void sendUserCreatedEvent(UserCredentials user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toSet());

        UserCreatedEvent userCreatedEvent = new UserCreatedEvent(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames,
                user.isEnabled()
        );
        userEventProducer.sendUserCreatedEvent(userCreatedEvent);
    }

    private void sendUserDeletedEvent(UserCredentials user) {
        UserDeletedEvent userDeletedEvent = new UserDeletedEvent();
        userDeletedEvent.setId(user.getId());
        userEventProducer.sendUserDeletedEvent(userDeletedEvent);
    }
}