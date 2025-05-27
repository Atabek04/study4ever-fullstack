package com.study4ever.authservice.service.impl;

import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.exception.NotFoundException;
import com.study4ever.authservice.repo.UserCredentialsRepository;
import com.study4ever.authservice.service.UserCredentialsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCredentialsServiceImpl implements UserCredentialsService {

    private final UserCredentialsRepository userCredentialsRepository;

    @Override
    public UserResponse getProfile(String userId) {
        var user = userCredentialsRepository.findByUsername(userId)
                .orElseThrow(() -> new NotFoundException("User with username " + userId + " not found"));
        var roleString = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roleString)
                .enabled(user.isEnabled())
                .build();
    }
}
