package com.study4ever.authservice.util;

import com.study4ever.authservice.model.UserCredentials;
import com.study4ever.authservice.dto.UserResponse;
import lombok.experimental.UtilityClass;

import java.util.Set;
import java.util.stream.Collectors;

@UtilityClass
public class Mapper {

    public UserResponse mapToUserResponse(UserCredentials user) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .enabled(user.isEnabled())
                .build();
    }
}
